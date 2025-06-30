#!/usr/bin/env node

import { generateFromFile } from './core';

export type ModeCodegenConfigPersist =
  | ModeCodegenConfigPersistStorage
  | ModeCodegenConfigPersistCookie;

export interface ModeCodegenConfigPersistStorage {
  type: 'localStorage' | 'sessionStorage';
  key?: string;
}

export interface ModeCodegenConfigPersistCookie {
  type?: 'cookie';
  key?: string;
  systemThemeKey?: string;
}

export interface ModeCodegenConfigApply {
  querySelector?: string;
  darkClassName?: string;
  lightClassName?: string | null;
}

export interface ModeCodegenConfig {
  persist?: ModeCodegenConfigPersist;
  apply?: ModeCodegenConfigApply;
  defaultMode?: import('@-ft/mode').Mode;
  variableName: string;
}

(async () => {
  try {
    await generateFromFile();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
