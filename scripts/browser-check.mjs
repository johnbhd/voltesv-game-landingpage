import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.env.BASE_URL || "http://localhost:3005";
const port = Number(process.env.CDP_PORT || 9333);
const candidates = [process.env.BROWSER_PATH, "C:/Users/JB VILLE/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
const executable = candidates.find((candidate) => candidate && existsSync(candidate));
if (!executable) throw new Error("Set BROWSER_PATH to a local Chromium or Edge executable.");
await mkdir("test-results", { recursive: true });
await mkdir(".cache/browser-check", { recursive: true });
const browser = spawn(executable, ["--headless", "--disable-gpu", "--no-first-run", "--disable-background-networking", ...(process.env.BROWSER_NO_SANDBOX === "1" ? ["--no-sandbox"] : []), `--remote-debugging-port=${port}`, `--user-data-dir=${resolve(".cache/browser-check")}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
const results = [];
const runtimeErrors = [];
const delay = (ms) => new Promise((done) => setTimeout(done, ms));
let id = 0;
const pending = new Map();

async function waitFor(check, message, timeout = 15000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check()) return;
    await delay(80);
  }
  throw new Error(message);
}

function send(method, params = {}) {
  return new Promise((resolvePromise, reject) => {
    const key = ++id;
    const timer = setTimeout(() => { pending.delete(key); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(key, { resolve: resolvePromise, reject, timer });
    socket.send(JSON.stringify({ id: key, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function check(name, action) {
  if (process.env.BROWSER_CHECK_FILTER && !new RegExp(process.env.BROWSER_CHECK_FILTER).test(name)) {
    return;
  }
  try {
    await action();
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
    console.error(await evaluate(`JSON.stringify({
      visibility: document.visibilityState,
      focus: document.hasFocus(),
      hero: document.querySelector('[data-hero-machine]')?.dataset.heroMachine,
      heroBounds: document.querySelector('[data-hero-machine]')?.getBoundingClientRect().toJSON(),
      selected: document.querySelector('[aria-selected=true]')?.id,
      focused: document.activeElement?.outerHTML.slice(0, 400),
    })`));
  }
}

async function viewport(width, height = 900, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
  await delay(120);
}

async function load() {
  await send("Page.navigate", { url: baseUrl });
  await send("Page.bringToFront");
  await waitFor(() => evaluate(`Boolean(document.querySelector('#machines [role="tab"]')) && document.readyState === 'complete'`), "Landing page did not render", 30000);
  await delay(1300);
}

async function screenshot(name, full = false) {
  const metrics = full ? (await send("Page.getLayoutMetrics")).cssContentSize : null;
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, ...(metrics ? { clip: { x: 0, y: 0, width: metrics.width, height: metrics.height, scale: 1 } } : {}) });
  await writeFile(`test-results/${name}.png`, Buffer.from(result.data, "base64"));
}

try {
  await waitFor(async () => { try { return (await fetch(`http://127.0.0.1:${port}/json/version`)).ok; } catch { return false; } }, "Chromium did not start", 15000);
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, reject) => { socket.addEventListener("open", done, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      runtimeErrors.push(message.params.args.map((argument) => (
        argument.value ?? argument.description ?? argument.type
      )).join(" "));
    }
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.__vitals={lcp:0,cls:0};new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__vitals.lcp=entry.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__vitals.cls+=entry.value}).observe({type:'layout-shift',buffered:true});` });
  await viewport(1440);
  await load();
  await check("CSS Modules attach to the rendered cinematic layout", async () => {
    assert.ok(await evaluate("parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)>48"), "Display typography was not applied");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('h1').closest('section')).position"), "relative");
    assert.ok(await evaluate("document.querySelector('h1').className.length>0"), "CSS Module class mappings are missing");
  });
  await check("site animations stay permanently enabled without a control", async () => {
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await evaluate("localStorage.setItem('voltes-motion', 'reduce')");
    await load();

    assert.equal(
      await evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"),
      true,
    );
    assert.equal(await evaluate("document.documentElement.dataset.motion"), "full");
    assert.equal(await evaluate("document.querySelector('[data-motion-toggle]')"), null);
    await delay(180);

    assert.notEqual(await evaluate("getComputedStyle(document.querySelector('h1')).animationName"), "none");

    await evaluate("window.scrollTo({top:240,behavior:'instant'});window.dispatchEvent(new Event('scroll'))");
    await delay(180);
    assert.ok(
      await evaluate("Number(getComputedStyle(document.querySelector('[data-hero-depth]')).getPropertyValue('--hero-scroll-progress')) > 0"),
      "Explicitly enabled hero parallax did not update",
    );

    await evaluate("window.scrollTo({top:0,behavior:'instant'})");
    await delay(180);
    assert.equal(
      await evaluate("document.querySelector('#download [data-scroll-reveal]').dataset.revealState"),
      "waiting",
    );
    await evaluate("document.querySelector('#download [data-scroll-reveal]').scrollIntoView({block:'center',behavior:'instant'})");
    await delay(180);
    assert.notEqual(
      await evaluate("getComputedStyle(document.querySelector('#download [data-scroll-reveal]')).transitionDuration"),
      "0s",
      "Explicitly enabled section reveal has no motion transition",
    );
    await waitFor(
      () => evaluate("document.querySelector('#download [data-scroll-reveal]').dataset.revealState === 'visible'"),
      "Section reveal did not complete",
    );

    await evaluate("localStorage.removeItem('voltes-motion')");
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    });
    await load();
  });
  await check("body copy follows the readable 16px minimum", async () => {
    assert.ok(await evaluate("parseFloat(getComputedStyle([...document.querySelector('h1').closest('section').querySelectorAll('p')].find(p=>p.textContent.includes('Take flight.'))).fontSize)>=16"), "Hero body copy is smaller than the specified 16px minimum");
  });
  await check("game identity, real art, valid anchors and preview release", async () => {
    assert.match(await evaluate("document.querySelector('h1').textContent"), /VOLTES VSTRIKE/);
    assert.equal(await evaluate("document.querySelectorAll('h1').length"), 1);
    assert.ok(await evaluate("[...document.querySelectorAll('link[rel~=icon]')].some(link => link.href.includes('/images/game/social.webp'))"), "Social artwork favicon is missing");
    assert.equal(
      await evaluate("[...document.querySelectorAll('a[href=\"#download\"]')].filter(link => /DOWNLOAD APK/i.test(link.textContent)).length >= 2"),
      true,
    );
    assert.equal(await evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>document.getElementById(a.hash.slice(1)))"), true);
    assert.equal(await evaluate("document.querySelector('#download button').disabled"), true);
    assert.match(await evaluate("document.querySelector('#download button').textContent"), /DOWNLOAD NOW/i);
    assert.equal(await evaluate("document.querySelectorAll('a[href$=\".apk\"]').length"), 0);
    assert.match(await evaluate("document.querySelector('#gameplay').textContent"), /COMING SOON/);
    assert.equal(await evaluate("document.querySelector('h1').closest('section').querySelector('img[alt]').complete"), true);
  });
  await check("hero fires the active machine projectile on click", async () => {
    await load();
    assert.equal(await evaluate("document.querySelectorAll('[data-hero-projectile]').length"), 0);

    await evaluate("document.querySelector('[data-hero-fire]').click()");
    await waitFor(
      () => evaluate("document.querySelector('[data-hero-projectile]')?.dataset.projectileMachine === 'crewzer'"),
      "Crewzer did not fire its mapped projectile",
    );
    assert.ok(await evaluate("decodeURIComponent(document.querySelector('[data-hero-projectile]').src).includes('weapon-crewzer.webp')"));
    await waitFor(
      () => evaluate("document.querySelector('[data-hero-projectile]').complete && document.querySelector('[data-hero-projectile]').naturalWidth > 0"),
      "Desktop projectile source did not load",
    );
    assert.ok(await evaluate("document.querySelector('[data-hero-projectile]').getAnimations().some(animation => animation.playState === 'running')"));
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-hero-projectile]')).width"), "220px");
    const desktopProjectileOrigin = JSON.parse(await evaluate(`JSON.stringify({
      left: parseFloat(getComputedStyle(document.querySelector('[data-hero-projectile]')).left),
      fieldWidth: document.querySelector('[data-hero-projectile]').parentElement.getBoundingClientRect().width,
    })`));
    assert.ok(
      Math.abs(desktopProjectileOrigin.left / desktopProjectileOrigin.fieldWidth - .46) < .005,
      `Desktop projectile origin is not centered at 46%: ${JSON.stringify(desktopProjectileOrigin)}`,
    );
    const desktopProjectileSource = await evaluate(`JSON.stringify({
      sizes: document.querySelector('[data-hero-projectile]').sizes,
      naturalWidth: document.querySelector('[data-hero-projectile]').naturalWidth,
      currentSrc: document.querySelector('[data-hero-projectile]').currentSrc,
    })`);
    assert.ok(
      JSON.parse(desktopProjectileSource).naturalWidth >= 220,
      `Desktop projectile source is too small for its rendered size: ${desktopProjectileSource}`,
    );
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-hero-projectile]')).animationDuration"), "1.25s");
    const launchStart = await evaluate("document.querySelector('[data-hero-projectile]').getBoundingClientRect().toJSON()");
    await delay(180);
    const launchMid = await evaluate("document.querySelector('[data-hero-projectile]').getBoundingClientRect().toJSON()");
    assert.ok(launchMid.top < launchStart.top - 20, "Projectile should travel quickly toward the top of the screen");
    assert.ok(launchMid.left > launchStart.left, "Projectile should follow the machine's rotated firing direction");
    await evaluate("document.querySelector('[data-hero-projectile]').dispatchEvent(new AnimationEvent('animationend', { bubbles: true }))");
    await delay(80);
    assert.equal(await evaluate("document.querySelectorAll('[data-hero-projectile]').length"), 0);

    await delay(1400);
    await evaluate("document.querySelector('[data-hero-fire]').click();document.querySelector('[data-hero-fire]').click()");
    await delay(100);
    assert.equal(await evaluate("document.querySelectorAll('[data-hero-projectile]').length"), 1);
    await delay(1500);
    await evaluate("document.querySelector('[data-hero-fire]').click()");
    await waitFor(
      () => evaluate("document.querySelectorAll('[data-hero-projectile]').length === 1"),
      "Projectile did not fire after the 1.5 second cooldown",
    );
    await delay(620);

    await load();
    await waitFor(
      () => evaluate("document.querySelector('[data-hero-machine]').dataset.heroMachine === 'bomber'"),
      "Hero did not rotate to Bomber before the projectile mapping check",
      6500,
    );
    await evaluate("document.querySelector('[data-hero-fire]').click()");
    await waitFor(
      () => evaluate("[...document.querySelectorAll('[data-hero-projectile]')].some(projectile => projectile.dataset.projectileMachine === 'bomber')"),
      "Bomber did not fire its mapped projectile",
    );
    assert.ok(await evaluate("[...document.querySelectorAll('[data-hero-projectile]')].some(projectile => decodeURIComponent(projectile.src).includes('weapon-bomber.webp'))"));

    await viewport(390, 844, true);
    await load();
    await evaluate("document.querySelector('[data-hero-fire]').click()");
    await waitFor(
      () => evaluate("document.querySelector('[data-hero-projectile]') !== null"),
      "Mobile hero did not fire a projectile",
    );
    await waitFor(
      () => evaluate("document.querySelector('[data-hero-projectile]').complete && document.querySelector('[data-hero-projectile]').naturalWidth > 0"),
      "Mobile projectile source did not load",
    );
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-hero-projectile]')).width"), "170px");
    const mobileProjectileOrigin = JSON.parse(await evaluate(`JSON.stringify({
      left: parseFloat(getComputedStyle(document.querySelector('[data-hero-projectile]')).left),
      fieldWidth: document.querySelector('[data-hero-projectile]').parentElement.getBoundingClientRect().width,
    })`));
    assert.ok(
      Math.abs(mobileProjectileOrigin.left / mobileProjectileOrigin.fieldWidth - .46) < .005,
      `Mobile projectile origin is not centered at 46%: ${JSON.stringify(mobileProjectileOrigin)}`,
    );
    assert.ok(
      await evaluate("document.querySelector('[data-hero-projectile]').naturalWidth >= 170"),
      "Mobile projectile source is too small for its rendered size",
    );
    await viewport(1430, 900, false);
    await load();
  });
  await check("same-page links use cancellable cinematic scrolling", async () => {
    await viewport(1430, 900, false);
    await load();
    assert.equal(await evaluate("getComputedStyle(document.documentElement).scrollBehavior"), "auto");
    assert.equal(await evaluate("document.querySelector('.skip-link').hasAttribute('data-scroll-instant')"), true);

    const machinesDestination = Number(await evaluate(`Math.min(
      document.querySelector('#machines').getBoundingClientRect().top + scrollY
        - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
      document.documentElement.scrollHeight - innerHeight
    )`));
    const startedAt = Number(await evaluate("performance.now()"));
    await evaluate("document.querySelector('#site-navigation a[href=\"#machines\"]').click()");
    await delay(300);
    const midwayY = Number(await evaluate("scrollY"));
    assert.ok(midwayY > 20 && midwayY < machinesDestination - 20, `Scroll did not visibly animate: ${midwayY}/${machinesDestination}`);
    assert.equal(await evaluate("location.hash"), "#machines");
    await waitFor(
      () => evaluate("Math.abs(document.querySelector('#machines').getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)) < 4"),
      "Animated scroll did not align Machines below the fixed header",
      1800,
    );
    const elapsed = Number(await evaluate("performance.now()")) - startedAt;
    assert.ok(elapsed >= 1000 && elapsed < 1700, `Animated scroll duration was not approximately 1100ms: ${elapsed}ms`);

    await evaluate("document.querySelector('a[href=\"#download\"]').click()");
    await delay(250);
    await evaluate("document.querySelector('a[href=\"#mission\"]').click()");
    await waitFor(
      () => evaluate("location.hash === '#mission' && Math.abs(document.querySelector('#mission').getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)) < 4"),
      "A second anchor did not replace the active scroll",
      1800,
    );

    await evaluate("document.querySelector('a[href=\"#download\"]').click()");
    await delay(220);
    await evaluate("window.dispatchEvent(new WheelEvent('wheel'))");
    const interruptedY = Number(await evaluate("scrollY"));
    await delay(400);
    assert.ok(Math.abs(Number(await evaluate("scrollY")) - interruptedY) < 3, "Manual input did not cancel animated scrolling");

    await evaluate("document.querySelector('footer a[href=\"#top\"]').click()");
    await waitFor(() => evaluate("scrollY < 3 && location.hash === '#top'"), "Back-to-top link did not animate to the page origin", 1800);
  });
  await check("fill images inside reveal wrappers keep a positioning context", async () => {
    assert.equal(
      await evaluate("getComputedStyle(document.querySelector('#mission img').parentElement).position"),
      "relative",
    );
  });
  await screenshot("desktop-hero");
  const desktopVitals = await evaluate("window.__vitals");
  await check("hostile scanner maps seven sprites and stays manual with cyclic navigation", async () => {
    assert.equal(await evaluate("document.querySelector('#hostiles')?.previousElementSibling.id"), "pilots");
    assert.equal(await evaluate("document.querySelector('#boss')?.previousElementSibling.id"), "hostiles");
    assert.equal(await evaluate("document.querySelector('#download')?.previousElementSibling.id"), "boss");
    assert.equal(await evaluate("document.querySelector('#hostiles h2').textContent.replace(/\\s+/g,' ').trim()"), "ENEMY FORCES");
    assert.equal(await evaluate("[...document.querySelectorAll('#site-navigation a')].find(link=>link.hash==='#hostiles').textContent.replace(/^\\d+/, '').trim()"), "Enemies");
    assert.equal(await evaluate("document.querySelectorAll('[data-enemy-selector]').length"), 7);
    await evaluate("document.querySelector('#hostiles').scrollIntoView({behavior:'instant'})");

    for (const [index, id, name] of [
      [0, "scout-drone", "Scout Drone"],
      [1, "scout-drone-02", "Scout Drone Variant 02"],
      [2, "hornet-fighter", "Hornet Fighter"],
      [3, "heavy-bomber", "Heavy Bomber"],
      [4, "crab-tank", "Crab Tank"],
      [5, "boazanian-spike", "Boazanian Spike"],
      [6, "elite-commander", "Elite Commander"],
    ]) {
      await evaluate(`document.querySelector('[data-enemy-selector="${id}"]').click()`);
      await waitFor(() => evaluate(`document.querySelector('[data-hostile-art="${id}"] img').complete && document.querySelector('[data-hostile-art="${id}"] img').naturalWidth>0`), "Hostile image did not load: " + id);
      assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), name);
      assert.match(await evaluate("document.querySelector('#hostile-status').textContent"), new RegExp(String(index + 1).padStart(2, "0") + " / 07"));
      assert.equal(await evaluate("document.querySelectorAll('[data-enemy-selector][aria-pressed=true]').length"), 1);
    }

    await evaluate("document.querySelector('[aria-label^=\"Next enemy\"]').click()");
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Scout Drone");
    await evaluate("document.querySelector('[aria-label^=\"Previous enemy\"]').click()");
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Elite Commander");
    await delay(5500);
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Elite Commander");
    await screenshot("desktop-hostiles");
  });
  await check("hostile selectors support keyboard input and rapid changes without layout jumps", async () => {
    await evaluate("document.querySelector('[data-enemy-selector=\"heavy-bomber\"]').focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r", windowsVirtualKeyCode: 13 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Heavy Bomber");
    await evaluate("document.querySelector('[data-enemy-selector=\"crab-tank\"]').focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", text: " ", unmodifiedText: " ", windowsVirtualKeyCode: 32 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Crab Tank");
    const before = await evaluate("document.querySelector('#hostile-scanner').getBoundingClientRect().height");
    await evaluate("document.querySelectorAll('[data-enemy-selector]').forEach(button=>button.click())");
    await delay(450);
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Elite Commander");
    assert.equal(await evaluate("document.querySelector('#hostile-scanner').getBoundingClientRect().height"), before);
    assert.equal(await evaluate("document.querySelectorAll('[data-hostile-art][data-active=true]').length"), 1);
  });
  await check("enemy and boss artwork preserve full silhouettes at every viewport", async () => {
    for (const width of [360, 390, 768, 1024, 1440]) {
      await viewport(width, width < 769 ? 844 : 900, width < 769);
      await evaluate("document.querySelector('#hostiles').scrollIntoView({behavior:'instant'})");
      const safeGap = width < 769 ? 20 : 28;

      for (const id of [
        "scout-drone",
        "scout-drone-02",
        "hornet-fighter",
        "heavy-bomber",
        "crab-tank",
        "boazanian-spike",
        "elite-commander",
      ]) {
        await evaluate(`document.querySelector('[data-enemy-selector="${id}"]').click()`);
        await waitFor(() => evaluate(`document.querySelector('[data-hostile-art="${id}"] img')?.complete && document.querySelector('[data-hostile-art="${id}"] img')?.naturalWidth>0`), "Enemy silhouette did not load: " + id);
        await delay(380);
        const bounds = await evaluate(`(()=>{
          const stage=document.querySelector('[data-hostile-stage]');
          const image=document.querySelector('[data-hostile-art="${id}"] img');
          if(!stage||!image)return null;
          const s=stage.getBoundingClientRect();
          const i=image.getBoundingClientRect();
          const scale=Math.min(i.width/image.naturalWidth,i.height/image.naturalHeight);
          const width=image.naturalWidth*scale;
          const height=image.naturalHeight*scale;
          const left=i.left+(i.width-width)/2;
          const top=i.top+(i.height-height)/2;
          return {position:getComputedStyle(image.parentElement.parentElement).position,left:left-s.left,right:s.right-(left+width),top:top-s.top,bottom:s.bottom-(top+height)};
        })()`);
        assert.ok(bounds, `Missing hostile artwork stage at ${width}px`);
        assert.notEqual(bounds.position, "absolute", `Hostile stage must contribute layout height at ${width}px`);
        assert.ok(Math.min(bounds.left, bounds.right, bounds.top, bounds.bottom) >= safeGap, `${id} needs a complete silhouette and safe padding at ${width}px: ${JSON.stringify(bounds)}`);
      }

      await evaluate("document.querySelector('#boss').scrollIntoView({behavior:'instant'})");
      await waitFor(() => evaluate("document.querySelector('#boss img')?.complete && document.querySelector('#boss img')?.naturalWidth>0"), "Boss silhouette did not load");
      await waitFor(
        () => evaluate(`(() => {
          const reveal = document.querySelector('#boss [data-scroll-reveal]');
          const style = getComputedStyle(reveal);
          return reveal.dataset.revealState === 'visible'
            && style.opacity === '1'
            && style.transform === 'none';
        })()`),
        "Boss reveal did not settle before measuring its silhouette",
        2500,
      );
      const bossBounds = await evaluate(`(()=>{
        const section=document.querySelector('#boss').getBoundingClientRect();
        const artwork=document.querySelector('[data-boss-artwork]');
        const image=artwork.querySelector('img').getBoundingClientRect();
        const release=document.querySelector('#download').getBoundingClientRect();
        return {position:getComputedStyle(artwork).position,left:image.left-section.left,right:section.right-image.right,bottom:section.bottom-image.bottom,separation:release.top-section.bottom};
      })()`);
      assert.notEqual(bossBounds.position, "absolute", `Boss artwork must use normal flow at ${width}px`);
      assert.ok(Math.min(bossBounds.left, bossBounds.right) >= -1, `Boss horns must remain in the section at ${width}px: ${JSON.stringify(bossBounds)}`);
      assert.ok(
        bossBounds.bottom >= (width < 769 ? 32 : 48),
        `Boss needs a safe bottom gap at ${width}px: ${JSON.stringify(bossBounds)}`,
      );
      assert.ok(bossBounds.separation >= -1, `Download section must not overlap the boss at ${width}px`);
    }
    await viewport(1440);
  });
  await check("boss artwork reveals once with a complete contained silhouette", async () => {
    await load();
    await delay(100);
    const revealSelector = "#boss [data-boss-reveal]";
    assert.ok(Number(await evaluate(`getComputedStyle(document.querySelector('${revealSelector}').parentElement).opacity`)) < 1, "Boss reveal should begin visually subdued while offscreen");
    await evaluate("document.querySelector('#boss').scrollIntoView({behavior:'instant'})");
    await waitFor(
      () => evaluate(`getComputedStyle(document.querySelector('${revealSelector}').parentElement).opacity === '1'`),
      "Boss reveal did not reach full opacity",
      2500,
    );
    await waitFor(() => evaluate("document.querySelector('#boss img').complete && document.querySelector('#boss img').naturalWidth>0"), "Boss image did not load");
    const bossText = await evaluate("document.querySelector('#boss').textContent");
    assert.match(bossText, /WARNING/);
    assert.match(bossText, /FINAL ENCOUNTER/);
    assert.match(bossText, /SKULL.*FORTRESS/s);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('#boss img')).objectFit"), "contain");
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${revealSelector}').parentElement).opacity`), "1");
    await evaluate("document.querySelector('#hostiles').scrollIntoView({behavior:'instant'})");
    await delay(150);
    await evaluate("document.querySelector('#boss').scrollIntoView({behavior:'instant'})");
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${revealSelector}').parentElement).opacity`), "1");
    await screenshot("desktop-boss");
  });
  await check("hostile scanner and boss remain usable on mobile", async () => {
    await viewport(390, 844, true);
    await evaluate("document.querySelector('#hostiles').scrollIntoView({behavior:'instant'})");
    const documentWidth = await evaluate("document.documentElement.scrollWidth");
    assert.ok(documentWidth <= 391, "Hostile scanner must not create page overflow");
    assert.ok(await evaluate("document.querySelector('#hostiles [aria-label=\"Select a hostile unit\"]').scrollWidth > document.querySelector('#hostiles [aria-label=\"Select a hostile unit\"]').clientWidth"), "Mobile selectors should scroll horizontally");
    await evaluate("document.querySelector('#hostiles [aria-label=\"Select a hostile unit\"]').scrollTo({left:10000,behavior:'instant'})");
    await delay(100);
    assert.ok(await evaluate("document.querySelector('#hostiles [aria-label=\"Select a hostile unit\"]').scrollLeft > 0"));
    await evaluate("document.querySelector('[data-enemy-selector=\"elite-commander\"]').click()");
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Elite Commander");
    await delay(400);
    await screenshot("mobile-hostiles");
    await evaluate("document.querySelector('#boss').scrollIntoView({behavior:'instant'})");
    await delay(1000);
    const bossBounds = await evaluate("(()=>{const r=document.querySelector('#boss img').getBoundingClientRect();return {left:r.left,right:r.right,width:r.width}})()");
    assert.ok(bossBounds.left >= -1 && bossBounds.right <= 391, "Boss horns must remain inside the mobile viewport");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('#boss img')).objectFit"), "contain");
    await screenshot("mobile-boss");
    await viewport(1440);
  });
  await check("full-body pilots follow machines without repeating their introductions", async () => {
    assert.equal(await evaluate("document.querySelector('#pilots')?.previousElementSibling.id"), "machines");
    assert.match(await evaluate("document.querySelector('#pilots h2').textContent"), /FIVE PILOTS.*ONE MISSION/s);
    await evaluate("document.querySelector('#pilots').scrollIntoView({behavior:'instant'})");
    assert.equal(await evaluate("document.querySelectorAll('#pilots article').length"), 5);

    for (const [id, name, assignment] of [
      ["crewzer", "Steve Armstrong", "Volt Crewzer"],
      ["bomber", "Mark Gordon", "Volt Bomber"],
      ["panzer", "Big Bert Armstrong", "Volt Panzer"],
      ["frigate", "Little John Armstrong", "Volt Frigate"],
      ["lander", "Jamie Robinson", "Volt Lander"],
    ]) {
      const selector = '#pilot-' + id;
      const text = await evaluate(`document.querySelector('${selector}').textContent`);
      assert.ok(text.includes(name));
      assert.ok(text.includes(assignment));
      await waitFor(() => evaluate(`document.querySelector('${selector} img').complete && document.querySelector('${selector} img').naturalWidth>0`), 'Pilot image did not load: ' + id);
      const intro = await evaluate(`document.querySelector('${selector} [data-pilot-intro]').textContent`);
      assert.ok(intro.length > 40);
      assert.equal(await evaluate(`document.querySelector('#machines').textContent.includes(${JSON.stringify(intro)})`), false);
    }
    await screenshot("desktop-pilots");
  });
  await check("pilot roster scrolls on mobile and remains keyboard accessible", async () => {
    await viewport(390, 844, true);
    await evaluate("document.querySelector('#pilots').scrollIntoView({behavior:'instant'})");
    assert.ok(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"));
    assert.ok(await evaluate("document.querySelector('#pilot-roster').scrollWidth>document.querySelector('#pilot-roster').clientWidth"));
    await evaluate("document.querySelector('#pilot-roster').focus();document.querySelector('#pilot-roster').scrollTo({left:0,behavior:'instant'})");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await waitFor(() => evaluate("document.querySelector('#pilot-roster').scrollLeft>0"), "Keyboard did not scroll the pilot roster");
    assert.ok(await evaluate("[...document.querySelectorAll('#pilots h3')].every(heading=>heading.scrollWidth<=heading.clientWidth+1)"));
    await evaluate("document.querySelector('#pilot-roster').scrollTo({left:10000,behavior:'instant'})");
    await delay(250);
    assert.equal(await evaluate("document.activeElement.id"), "pilot-roster");
    assert.ok(await evaluate("document.querySelector('#pilot-lander').getBoundingClientRect().right<=innerWidth+1"));
    await screenshot("mobile-pilots");
    await viewport(1440);
  });
  await check("hero rotates the roster every five seconds independently from the showcase", async () => {
    await load();
    assert.equal(await evaluate("document.querySelector('[data-hero-machine]')?.dataset.heroMachine"), "crewzer");
    await evaluate("document.querySelector('#tab-panzer').click()");
    for (const machine of ["bomber", "panzer", "frigate", "lander", "crewzer"]) {
      await waitFor(
        () => evaluate(`document.querySelector('[data-hero-machine]').dataset.heroMachine === '${machine}'`),
        `Hero did not advance to ${machine}`,
        6500,
      );
      assert.equal(await evaluate("document.querySelector('[role=tab][aria-selected=true]').id"), "tab-panzer");
    }
  });
  await check("hero pauses offscreen and when document visibility is hidden", async () => {
    await load();
    await evaluate("document.querySelector('#machines').scrollIntoView({behavior:'instant'})");
    await delay(150);
    const beforeScroll = await evaluate("document.querySelector('[data-hero-machine]').dataset.heroMachine");
    await delay(5300);
    assert.equal(await evaluate("document.querySelector('[data-hero-machine]').dataset.heroMachine"), beforeScroll);
    await evaluate("window.scrollTo({top:0,behavior:'instant'});Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))");
    await delay(150);
    const beforeHidden = await evaluate("document.querySelector('[data-hero-machine]').dataset.heroMachine");
    await delay(5300);
    assert.equal(await evaluate("document.querySelector('[data-hero-machine]').dataset.heroMachine"), beforeHidden);
    await evaluate("delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))");
    await waitFor(() => evaluate(`document.querySelector('[data-hero-machine]').dataset.heroMachine !== '${beforeHidden}'`), "Hero did not resume", 6500);
  });
  await check("manual showcase stays initially selected across multiple rotation intervals", async () => {
    await load();
    await delay(10500);
    assert.equal(await evaluate("document.querySelector('[role=tab][aria-selected=true]').id"), "tab-crewzer");
  });
  await check("content artwork and descriptions follow all five machine selections", async () => {
    for (const [machine, weapon, skill, pilot] of [
      ["crewzer", "Energy Blast", "Crewzer Overdrive", "Steve Armstrong"],
      ["bomber", "Twin Blast", "Bombardment Strike", "Mark Gordon"],
      ["panzer", "Heavy Blast", "Power Shot", "Big Bert Armstrong"],
      ["frigate", "Pulse Shot", "Rapid Barrage", "Little John Armstrong"],
      ["lander", "Wide Energy Blast", "Energy Shield", "Jamie Robinson"],
    ]) {
      await evaluate(`document.querySelector('#tab-${machine}').click()`);
      await delay(400);
      const content = await evaluate("document.querySelector('[data-machine-details][data-active=true]').textContent");
      for (const name of [weapon, skill, pilot]) assert.ok(content.includes(name), name);
      const images = await evaluate("[...document.querySelector('[data-machine-details][data-active=true]').querySelectorAll('img')].map(img=>({src:decodeURIComponent(img.currentSrc||img.src),loaded:img.complete&&img.naturalWidth>0}))");
      assert.ok(images.some((img) => img.src.includes(`weapon-${machine}`) && img.loaded));
      assert.ok(images.some((img) => img.src.includes(`skill-${machine}`) && img.loaded));
      assert.equal(images.length, 3);
      assert.equal(await evaluate("document.querySelectorAll('[data-machine-details]:not([inert])').length"), 1);
    }
  });
  await check("named cyclic controls show the destination and support Enter and Space", async () => {
    await evaluate("document.querySelector('#tab-crewzer').click()");
    assert.match(await evaluate("document.querySelector('button[aria-label^=\"Previous machine\"]').textContent"), /LANDER/i);
    assert.match(await evaluate("document.querySelector('button[aria-label^=\"Next machine\"]').textContent"), /BOMBER/i);
    assert.match(await evaluate("document.querySelector('button[aria-label^=\"Previous machine\"]').getAttribute('aria-label')"), /Lander/);
    assert.match(await evaluate("document.querySelector('button[aria-label^=\"Next machine\"]').getAttribute('aria-label')"), /Bomber/);
    await evaluate("document.querySelector('button[aria-label^=\"Previous machine\"]').focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await waitFor(() => evaluate("document.querySelector('#tab-lander').getAttribute('aria-selected')==='true'"), "Previous did not loop to Lander");
    await evaluate("document.querySelector('button[aria-label^=\"Next machine\"]').focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " ", unmodifiedText: " " });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    await waitFor(() => evaluate("document.querySelector('#tab-crewzer').getAttribute('aria-selected')==='true'"), "Next did not loop to Crewzer");
  });
  await check("layout stability and touch targets hold across machines and viewport widths", async () => {
    for (const width of [360, 390, 768, 1024, 1440]) {
      await viewport(width, width < 769 ? 844 : 900, width < 769);
      await evaluate("document.querySelector('#machines').scrollIntoView({behavior:'instant'})");
      const heights = [];
      for (const machine of ["crewzer", "bomber", "panzer", "frigate", "lander"]) {
        await evaluate(`document.querySelector('#tab-${machine}').click()`);
        await delay(400);
        heights.push(await evaluate("document.querySelector('#machine-panel').getBoundingClientRect().height"));
        assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), `Overflow at ${width}`);
        assert.ok(await evaluate("[...document.querySelectorAll('button[aria-label^=\"Previous machine\"],button[aria-label^=\"Next machine\"]')].every(button=>button.getBoundingClientRect().height>=44)"));
      }
      assert.ok(Math.max(...heights) - Math.min(...heights) <= 1, `Details shift at ${width}px: ${heights}`);
    }
    await viewport(1440);
  });
  await check("machine selection updates art, pilot, weapon and accessible state", async () => {
    await evaluate("document.querySelector('#tab-panzer').click()");
    await waitFor(() => evaluate("document.querySelector('#machine-panel [data-active=true] h3').textContent.includes('Panzer')"), "Panzer did not select");
    assert.equal(await evaluate("document.querySelector('#tab-panzer').getAttribute('aria-selected')"), "true");
    assert.match(await evaluate("document.querySelector('#machine-panel [data-active=true]').textContent"), /Big Bert Armstrong/);
    assert.equal(await evaluate("document.querySelector('#machine-panel img:not([alt=\"\"]):not([width=\"56\"])').alt.includes('Volt Panzer')"), true);
  });
  await check("rapid machine changes settle on the last choice", async () => {
    await evaluate("['crewzer','panzer','bomber','frigate','lander'].forEach(id=>document.querySelector('#tab-'+id).click())");
    await delay(420);
    assert.match(await evaluate("document.querySelector('#machine-panel [data-active=true] h3').textContent"), /Lander/);
    assert.match(await evaluate("document.querySelector('#machine-panel [data-active=true]').textContent"), /Jamie Robinson/);
    assert.equal(await evaluate("document.querySelectorAll('[role=tab][aria-selected=true]').length"), 1);
    assert.equal(await evaluate("document.querySelectorAll('#machine-panel > div:first-child img').length"), 1);
  });
  await check("keyboard tabs wrap and support Home/End", async () => {
    await evaluate("document.querySelector('#tab-lander').focus()");
    for (const [key, expected] of [["ArrowRight", "crewzer"], ["End", "lander"], ["Home", "crewzer"], ["ArrowLeft", "lander"]]) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key });
      await waitFor(() => evaluate(`document.querySelector('#tab-${expected}').getAttribute('aria-selected')==='true'`), `Keyboard ${key} failed`);
      assert.equal(await evaluate("document.activeElement.id"), `tab-${expected}`);
    }
  });
  await evaluate("document.querySelector('#tab-crewzer').click();document.querySelector('#machines').scrollIntoView({behavior:'instant'})");
  await delay(700);
  await screenshot("desktop-machines");
  await evaluate("document.activeElement?.blur();document.querySelector('#machine-panel').scrollIntoView({block:'center',behavior:'instant'})");
  await delay(150);
  await screenshot("desktop-machine-details");
  await evaluate("document.querySelector('#download').scrollIntoView({behavior:'instant'})");
  await delay(300);
  await evaluate("document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})");
  await delay(150);
  await screenshot("desktop-page", true);
  await check("responsive layouts have no page overflow or clipped headings", async () => {
    for (const width of [360, 390, 768, 1024, 1440]) {
      await viewport(width, width < 769 ? 844 : 900, width < 769);
      assert.ok(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"), `Page overflow at ${width}px`);
      const clipped = await evaluate("[...document.querySelectorAll('h1,h2,h3')].filter(el=>{if(el.closest('#pilot-roster'))return false;const r=el.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1}).map(el=>el.textContent)");
      assert.deepEqual(clipped, [], `Clipped headings at ${width}px`);
    }
  });
  await check("hero artwork stays contained at mobile tablet and desktop sizes", async () => {
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      await viewport(width, width <= 768 ? 844 : 900, width <= 768);
      await evaluate("window.scrollTo({top:0,behavior:'instant'})");
      await delay(120);
      const bounds = await evaluate(`(() => {
        const visual = document.querySelector('[data-hero-visual]');
        const artwork = document.querySelector('[data-hero-artwork]');
        if (!visual || !artwork) return null;
        const visualRect = visual.getBoundingClientRect();
        const artworkRect = artwork.getBoundingClientRect();
        return {
          visualLeft: visualRect.left,
          visualRight: visualRect.right,
          visualCenter: visualRect.left + visualRect.width / 2,
          artworkLeft: artworkRect.left,
          artworkRight: artworkRect.right,
        };
      })()`);
      assert.ok(bounds, `Hero artwork hooks are missing at ${width}px`);
      if (width <= 768) {
        assert.ok(Math.abs(bounds.visualCenter - width / 2) <= 5, `Hero visual is not centered at ${width}px`);
      } else if (width < 1200) {
        assert.ok(bounds.visualLeft >= width * .55, `Hero visual needs more separation from the title at ${width}px: ${JSON.stringify(bounds)}`);
      } else {
        assert.ok(bounds.visualLeft >= width * .54, `Hero visual needs more separation from the title at ${width}px: ${JSON.stringify(bounds)}`);
      }
      assert.ok(bounds.artworkLeft >= 4, `Hero artwork is clipped on the left at ${width}px: ${JSON.stringify(bounds)}`);
      assert.ok(bounds.artworkRight <= width - 4, `Hero artwork is clipped on the right at ${width}px: ${JSON.stringify(bounds)}`);
    }
  });
  await check("hero depth responds to scroll without moving the layout box", async () => {
    await viewport(1440, 900, false);
    await load();
    const before = await evaluate(`(() => {
      const depth = document.querySelector('[data-hero-depth]');
      const hero = document.querySelector('[data-hero-machine]');
      return {
        progress: Number(getComputedStyle(depth).getPropertyValue('--hero-scroll-progress')),
        top: hero.getBoundingClientRect().top,
        height: hero.getBoundingClientRect().height,
      };
    })()`);
    await evaluate(`window.scrollTo({top:240,behavior:'instant'});
      window.dispatchEvent(new Event('scroll'));
      document.querySelector('[data-hero-depth]').dispatchEvent(
        new PointerEvent('pointermove', { clientX: 900, clientY: 400, pointerType: 'mouse' })
      );`);
    await delay(180);
    const after = await evaluate(`(() => {
      const depth = document.querySelector('[data-hero-depth]');
      const hero = document.querySelector('[data-hero-machine]');
      return {
        progress: Number(getComputedStyle(depth).getPropertyValue('--hero-scroll-progress')),
        top: hero.getBoundingClientRect().top,
        height: hero.getBoundingClientRect().height,
      };
    })()`);
    assert.equal(before.progress, 0);
    assert.ok(after.progress > 0 && after.progress < 1, "Hero scroll progress did not update");
    assert.equal(after.height, before.height, "Hero depth must not change layout height");
    assert.ok(Math.abs((after.top - before.top) + 240) <= 1, "Hero depth must not shift the section layout box");
  });
  await check("major below-fold groups reveal once and stay visible", async () => {
    await load();
    await delay(180);
    assert.ok(await evaluate("document.querySelectorAll('[data-scroll-reveal]').length >= 8"), "Major section reveals are missing");
    assert.ok(await evaluate("document.querySelector('#hostiles [data-scroll-reveal]') !== null"), "Enemy Forces reveal is missing");
    assert.ok(await evaluate("document.querySelector('#download [data-scroll-reveal]') !== null"), "Download reveal is missing");
    assert.equal(await evaluate("document.querySelector('#download [data-scroll-reveal]').dataset.revealState"), "waiting");
    await evaluate("document.querySelector('#download [data-scroll-reveal]').scrollIntoView({block:'center',behavior:'instant'})");
    await delay(180);
    assert.notEqual(
      await evaluate("getComputedStyle(document.querySelector('#download [data-scroll-reveal]')).transitionDuration"),
      "0s",
      "Reveal should have a visible transition into view",
    );
    await waitFor(() => evaluate("getComputedStyle(document.querySelector('#download [data-scroll-reveal]')).opacity === '1'"), "Download content did not reveal");
    await evaluate("window.scrollTo({top:0,behavior:'instant'})");
    await delay(180);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('#download [data-scroll-reveal]')).opacity"), "1");
  });
  await check("hero entrance waits for artwork and visibly animates on fresh load", async () => {
    await viewport(1440, 900, false);
    await send("Page.navigate", { url: baseUrl });
    await waitFor(
      () => evaluate("document.querySelector('[data-hero-depth]')?.dataset.introReady === 'true'"),
      "Hero entrance never started",
    );
    await delay(220);
    assert.ok(await evaluate(`document.querySelector('[data-hero-artwork]').complete
      && document.querySelector('[data-hero-artwork]').naturalWidth > 0`));
    assert.ok(await evaluate(`document.querySelector('[data-hero-artwork-layer]')
      .getAnimations().some(animation => animation.playState === 'running')`), "Machine entrance is not visibly running");
    await screenshot("desktop-hero-intro");
    await delay(1500);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('h1')).opacity"), "1");
  });
  await viewport(390, 844, true);
  await evaluate("window.scrollTo({top:0,behavior:'instant'})");
  await delay(300);
  await screenshot("mobile-hero");
  await check("mobile menu opens, closes on Escape and restores focus", async () => {
    await evaluate("document.querySelector('button[aria-controls=site-navigation]').click()");
    await waitFor(() => evaluate("document.querySelector('button[aria-controls=site-navigation]').getAttribute('aria-expanded')==='true'"), "Mobile navigation did not open");
    assert.notEqual(await evaluate("getComputedStyle(document.querySelector('#site-navigation')).display"), "none");
    await waitFor(() => evaluate("document.activeElement === document.querySelector('#site-navigation a')"), "Opening the mobile menu must focus its first link");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape" });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape" });
    await waitFor(() => evaluate("document.querySelector('button[aria-controls=site-navigation]').getAttribute('aria-expanded')==='false'"), "Escape did not close navigation");
    assert.equal(await evaluate("document.activeElement.getAttribute('aria-controls')"), "site-navigation");
  });
  await evaluate("document.querySelector('#machines').scrollIntoView({behavior:'instant'})");
  await delay(250);
  await check("horizontal mobile swipe selects without moving the page", async () => {
    await evaluate("document.querySelector('#machine-panel > div:first-child').scrollIntoView({block:'center',behavior:'instant'})");
    await delay(150);
    const rect = await evaluate("(()=>{const r=document.querySelector('#machine-panel > div:first-child').getBoundingClientRect();return {x:r.x+r.width*.72,y:r.y+r.height*.5}})()");
    const scrollBefore = await evaluate("window.scrollY");
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: rect.x, y: rect.y }] });
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: rect.x - 90, y: rect.y + 2 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await waitFor(() => evaluate("document.querySelector('#tab-bomber').getAttribute('aria-selected')==='true'"), "Swipe did not select Bomber");
    assert.ok(Math.abs((await evaluate("window.scrollY")) - scrollBefore) <= 2, "Selecting a machine must not move the page vertically");
  });
  await screenshot("mobile-machines");
  await evaluate("document.querySelector('#machine-panel [data-active=true]').scrollIntoView({block:'center',behavior:'instant'})");
  await delay(150);
  await screenshot("mobile-machine-details");
  await check("footer machine controls preserve vertical scroll position", async () => {
    await evaluate("document.querySelector('button[aria-label^=\"Next machine\"]').scrollIntoView({block:'center',behavior:'instant'})");
    await delay(200);
    const before = await evaluate("window.scrollY");
    await evaluate("document.querySelector('button[aria-label^=\"Next machine\"]').click()");
    await delay(400);
    assert.ok(Math.abs((await evaluate("window.scrollY")) - before) <= 2, "Footer controls must not scroll the page back to the tab row");
  });
  await check("vertical touch gestures do not change the selected machine", async () => {
    await evaluate("document.querySelector('#machine-panel > div:first-child').scrollIntoView({block:'center',behavior:'instant'})");
    await delay(150);
    const selected = await evaluate("document.querySelector('[role=tab][aria-selected=true]').id");
    const point = await evaluate("(()=>{const r=document.querySelector('#machine-panel > div:first-child').getBoundingClientRect();return{x:r.x+r.width*.5,y:r.y+r.height*.6}})()");
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: point.x, y: point.y }] });
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: point.x + 8, y: point.y - 90 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.equal(await evaluate("document.querySelector('[role=tab][aria-selected=true]').id"), selected);
  });
  await check("missing machine artwork has an honest fallback without stale data", async () => {
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Network.setBlockedURLs", { urls: ["*volt-bomber*"] });
    await load();
    await evaluate("document.querySelector('#tab-bomber').click()");
    await evaluate("document.querySelector('#machine-panel').scrollIntoView({behavior:'instant'})");
    await waitFor(() => evaluate("document.querySelector('#machine-panel').textContent.includes('Artwork unavailable')"), "Missing image fallback did not appear");
    assert.match(await evaluate("document.querySelector('#machine-panel [data-active=true]').textContent"), /Mark Gordon/);
    await send("Network.setBlockedURLs", { urls: [] });
    await send("Network.setCacheDisabled", { cacheDisabled: false });
  });
  await check("missing supporting sprites preserve selected weapon and ability content", async () => {
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Network.setBlockedURLs", { urls: ["*weapon-panzer*", "*skill-panzer*"] });
    await load();
    await evaluate("document.querySelector('#tab-panzer').click();document.querySelector('[data-machine-details][data-active=true]').scrollIntoView({block:'center',behavior:'instant'})");
    await waitFor(() => evaluate("document.querySelector('[data-machine-details][data-active=true]').textContent.split('Artwork unavailable').length===3"), "Supporting artwork fallbacks did not appear");
    const text = await evaluate("document.querySelector('[data-machine-details][data-active=true]').textContent");
    assert.match(text, /Heavy Blast/);
    assert.match(text, /Power Shot/);
    assert.match(text, /Big Bert Armstrong/);
    await send("Network.setBlockedURLs", { urls: [] });
    await send("Network.setCacheDisabled", { cacheDisabled: false });
  });
  await check("missing hostile artwork keeps the selected dossier usable", async () => {
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Network.setBlockedURLs", { urls: ["*hostile-heavy-bomber*"] });
    await load();
    await evaluate("document.querySelector('[data-enemy-selector=\"heavy-bomber\"]').click();document.querySelector('#hostiles').scrollIntoView({behavior:'instant'})");
    await waitFor(() => evaluate("document.querySelector('[data-hostile-art=\"heavy-bomber\"]').textContent.includes('ARTWORK UNAVAILABLE')"), "Missing hostile image fallback did not appear");
    assert.equal(await evaluate("document.querySelector('#hostile-name').textContent"), "Heavy Bomber");
    assert.equal(await evaluate("document.querySelector('[data-enemy-selector=\"heavy-bomber\"]').getAttribute('aria-pressed')"), "true");
    await send("Network.setBlockedURLs", { urls: [] });
    await send("Network.setCacheDisabled", { cacheDisabled: false });
  });
  await check("missing boss artwork preserves the final encounter", async () => {
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Network.setBlockedURLs", { urls: ["*boss-skull-fortress*"] });
    await load();
    await evaluate("document.querySelector('#boss').scrollIntoView({behavior:'instant'})");
    await waitFor(() => evaluate("document.querySelector('#boss').textContent.includes('FORTRESS ARTWORK UNAVAILABLE')"), "Missing boss image fallback did not appear");
    assert.match(await evaluate("document.querySelector('#boss').textContent"), /FINAL ENCOUNTER/);
    assert.match(await evaluate("document.querySelector('#boss').textContent"), /SKULL.*FORTRESS/s);
    assert.ok(await evaluate("document.querySelector('#boss [data-boss-artwork]').getBoundingClientRect().height > 300"), "Boss fallback must preserve its image stage");
    await send("Network.setBlockedURLs", { urls: [] });
    await send("Network.setCacheDisabled", { cacheDisabled: false });
  });
  await check("content remains readable without JavaScript", async () => {
    await send("Emulation.setScriptExecutionDisabled", { value: true });
    await load();
    assert.equal(await evaluate("getComputedStyle(document.querySelector('h1')).opacity"), "1");
    assert.match(await evaluate("document.querySelector('#machine-panel [data-active=true] h3').textContent"), /Crewzer/);
    assert.match(await evaluate("document.querySelector('#hostiles').textContent"), /ENEMY.*FORCES.*Scout Drone/s);
    assert.match(await evaluate("document.querySelector('#boss').textContent"), /FINAL ENCOUNTER/);
    await send("Emulation.setScriptExecutionDisabled", { value: false });
  });
  await check("no uncaught runtime or console errors", async () => assert.deepEqual(runtimeErrors, []));
  await writeFile("test-results/browser-report.json", JSON.stringify({ baseUrl, browser: executable, results, desktopVitals, note: "Local Chromium smoke measurements; not Lighthouse or a field Core Web Vitals assessment." }, null, 2));
  const failures = results.filter((result) => !result.passed);
  console.log(`${results.length - failures.length}/${results.length} browser checks passed. Screenshots: test-results/.`);
  assert.equal(failures.length, 0, failures.map((failure) => failure.name).join("; "));
} finally {
  socket?.close();
  browser.kill();
}
