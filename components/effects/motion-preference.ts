"use client";

import { useSyncExternalStore } from "react";

type MotionSetting = "full" | "reduce";

const storageKey = "voltes-motion";
const listeners = new Set<() => void>();

let initialized = false;
let mediaQuery: MediaQueryList | null = null;
let setting: MotionSetting | null = null;

function resolveMotionSetting(): MotionSetting {
  if (setting) {
    return setting;
  }

  return mediaQuery?.matches ? "reduce" : "full";
}

function updateDocument() {
  document.documentElement.dataset.motion = resolveMotionSetting();
}

function notifyListeners() {
  updateDocument();
  listeners.forEach((listener) => listener());
}

function initialize() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  try {
    const savedSetting = window.localStorage.getItem(storageKey);
    setting = savedSetting === "full" || savedSetting === "reduce"
      ? savedSetting
      : null;
  } catch {
    setting = null;
  }

  mediaQuery.addEventListener("change", notifyListeners);
  updateDocument();
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  if (typeof document === "undefined") {
    return true;
  }

  return document.documentElement.dataset.motion !== "full";
}

function getServerSnapshot() {
  return true;
}

export function isMotionReduced() {
  initialize();
  return resolveMotionSetting() === "reduce";
}

export function setMotionEnabled(enabled: boolean) {
  initialize();
  setting = enabled ? "full" : "reduce";

  try {
    window.localStorage.setItem(storageKey, setting);
  } catch {
    // The current page can still honor the selection when storage is unavailable.
  }

  notifyListeners();
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
