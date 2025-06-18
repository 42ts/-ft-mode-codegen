/** how to save/load mode */
export interface ModeCodegenConfigPersist {
  /** where to store the mode. default is 'cookie' for SSR */
  type?: 'cookie' | 'localStorage' | 'sessionStorage';
  /** cookie name, or local/session storage key. default is 'mode'. */
  key?: string;
  /** cookie name for store system theme. default is undefined. */
  cookieSystemThemeKey?: string;
  /** don't save in generated code. default is false. */
  custom?: boolean;
}

/** how to apply the theme - custom: do nothing */
export type ModeCodegenConfigApply =
  | {
      /** which element to add class. default is 'html' */
      querySelector?: string;
      /** class name to add on dark theme. default is 'dark`. */
      darkClassName?: string;
      /** class name to add on light theme. default is null. */
      lightClassName?: string | null;
    }
  | 'custom';

/** @-ft/mode-codegen config (mode.config.json) */
export interface ModeCodegenConfig {
  /** persist strategy */
  persist?: ModeCodegenConfigPersist;
  /** apply strategy */
  apply?: ModeCodegenConfigApply;
  /** default theme mode. default is 'system' */
  defaultMode?: import('@-ft/mode').Mode;
  /** variable name of exposed ModeManager */
  variableName: string;
}
