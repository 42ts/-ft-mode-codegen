import { generateFromFile } from './core';

export interface ModeCodegenConfigPersist {
  type?: 'cookie' | 'localStorage' | 'sessionStorage';
  key?: string;
  cookieSystemThemeKey?: string;
  custom?: boolean;
}

export type ModeCodegenConfigApply =
  | {
      querySelector?: string;
      darkClassName?: string;
      lightClassName?: string | null;
    }
  | 'custom';

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
