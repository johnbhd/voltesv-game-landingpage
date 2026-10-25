import assert from "node:assert/strict";
import test from "node:test";
import { createRotationClock } from "../components/effects/rotation-clock.ts";

function setup() {
  let now = 0;
  let nextId = 0;
  let advances = 0;
  const tasks = new Map<number, { at: number; callback: () => void }>();
  const clock = createRotationClock({
    now: () => now,
    schedule: (callback, delay) => {
      const id = ++nextId;
      tasks.set(id, { at: now + delay, callback });
      return id;
    },
    cancel: (id) => {
      tasks.delete(id);
    },
    advance: () => {
      advances += 1;
    },
  });

  function tick(duration: number) {
    const end = now + duration;
    while (true) {
      const next = [...tasks.entries()]
        .filter(([, task]) => task.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at;
      tasks.delete(next[0]);
      next[1].callback();
    }
    now = end;
  }

  return { clock, tick, tasks, advances: () => advances };
}

test("rotation advances at five seconds and keeps one scheduled timer", () => {
  const state = setup();
  state.clock.setRunning(true);
  state.clock.setRunning(true);
  assert.equal(state.tasks.size, 1);
  state.tick(4999);
  assert.equal(state.advances(), 0);
  state.tick(1);
  assert.equal(state.advances(), 1);
  state.tick(20000);
  assert.equal(state.advances(), 5);
  assert.equal(state.tasks.size, 1);
});

test("offscreen or hidden tab pauses preserve remaining time", () => {
  const state = setup();
  state.clock.setRunning(true);
  state.tick(2300);
  state.clock.setRunning(false);
  assert.equal(state.tasks.size, 0);
  state.tick(30000);
  assert.equal(state.advances(), 0);
  state.clock.setRunning(true);
  state.tick(2699);
  assert.equal(state.advances(), 0);
  state.tick(1);
  assert.equal(state.advances(), 1);
});

test("dispose cancels pending work and prevents restarting after unmount", () => {
  const state = setup();
  state.clock.setRunning(true);
  state.tick(1000);
  state.clock.dispose();
  state.clock.setRunning(true);
  state.tick(60000);
  assert.equal(state.tasks.size, 0);
  assert.equal(state.advances(), 0);
});
