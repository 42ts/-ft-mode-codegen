import { readFile, writeFile } from 'fs/promises';
import type { ModeCodegenConfig } from './bin';
import {
  FunctionNode,
  IdentifierManager,
  RawNode,
  VariableManager,
} from './ast';

export function validateMode(
  mode: any
): asserts mode is 'system' | 'dark' | 'light' {
  if (mode !== 'system' && mode !== 'dark' && mode !== 'light')
    throw new Error(`Invalid mode: ${mode}`);
}

export function validatePersist(persist: any): void {
  if (
    persist.type !== 'cookie' &&
    persist.type !== 'localStorage' &&
    persist.type !== 'sessionStorage'
  )
    throw new Error(`Invalid persist type: ${persist.type}`);
  if (persist.key !== undefined && typeof persist.key !== 'string')
    throw new Error('Invalid persist key: string expected');
  if (
    persist.cookieSystemThemeKey !== undefined &&
    typeof persist.cookieSystemThemeKey !== 'string'
  )
    throw new Error(
      'Invalid persist cookieSystemThemeKey: string or undefined expected'
    );
  if (persist.custom !== undefined && typeof persist.custom !== 'boolean')
    throw new Error('Invalid persist custom: boolean expected');
}

export function validateApply(apply: any): void {
  if (apply === 'custom') return;
  if (typeof apply !== 'object') throw new Error('Invalid apply object given');
  if (
    apply.querySelector !== undefined &&
    typeof apply.querySelector !== 'string'
  )
    throw new Error('Invalid apply query selector: string expected');
  if (
    apply.darkClassName !== undefined &&
    (typeof apply.darkClassName !== 'string' || !apply.darkClassName)
  )
    throw new Error('Invalid apply dark class name');
  if (
    apply.lightClassName !== undefined &&
    apply.lightClassName !== null &&
    (typeof apply.lightClassName !== 'string' || !apply.lightClassName)
  )
    throw new Error('Invalid apply light class name');
}

export function validateConfig(config: ModeCodegenConfig): void {
  if (typeof config.variableName !== 'string')
    throw new Error('variable name must be a string');
  if (config.defaultMode !== undefined) validateMode(config.defaultMode);
  if (config.persist !== undefined) validatePersist(config.persist);
  if (config.apply !== undefined) validateApply(config.apply);
}

export function addslashes(str: string): string {
  return str.replace(/[\\"']/g, '\\$&');
}

export function generateCode(config: ModeCodegenConfig): string {
  validateConfig(config);
  const idm = new IdentifierManager();
  const vm = new VariableManager(idm);

  const q = vm.create("window.matchMedia('(prefers-color-scheme: dark)')");
  const M = vm.create('[]');
  const T = vm.create('[]');
  const l = vm.create("'light'");
  const d = vm.create("'dark'");
  const X = vm.create("'system'");
  const C = vm.create("'change'");

  let K: string | null = null;
  if (!config.persist?.custom) {
    K = vm.create(`'${addslashes(config.persist?.key ?? 'dark')}'`);
  }

  let y: string | null = null;
  let Y: string | null = null;
  if (config.apply !== 'custom') {
    y = vm.create(`'${addslashes(config.apply?.darkClassName ?? 'dark')}'`);
    if (config.apply?.lightClassName) {
      Y = vm.create(`'${addslashes(config.apply.lightClassName)}'`);
    }
  }

  const body: RawNode[] = [];
  body.push(new RawNode('var m,t,H;'));
  body.push(new RawNode(`function x(_){return _==${l}||_==${d}?_:${X}}`));

  if (config.apply === 'custom') {
    body.push(new RawNode(`function s(_){t=_;T.forEach(function(_){_(t)})}`));
  } else {
    const selector = addslashes(config.apply?.querySelector ?? 'html');
    let applyCode = `_=document.querySelector('${selector}').classList;if(t==${d})_.add(${y});else _.remove(${y})`;
    if (Y) applyCode += `;if(t==${l})_.add(${Y});else _.remove(${Y})`;
    body.push(new RawNode(`function s(_){t=_;T.forEach(function(_){_(t)});${applyCode}}`));
  }

  let saveFuncName: string | null = null;
  if (!config.persist?.custom) {
    saveFuncName = idm.next();
    if (!config.persist?.type || config.persist.type === 'cookie') {
      const cookieSystemThemeKey = config.persist?.cookieSystemThemeKey
        ? `;document.cookie='${addslashes(config.persist.cookieSystemThemeKey)}='+(q.matches?${d}:${l})+'; path=/'`
        : '';
      body.push(new RawNode(`function ${saveFuncName}(){document.cookie=${K}+'='+m+'; path=/'${cookieSystemThemeKey}}`));
    } else {
      body.push(new RawNode(`function ${saveFuncName}(){${config.persist.type}.setItem(${K},m)}`));
    }
  }

  const fallbackToDefault =
    !config.defaultMode || config.defaultMode === 'system'
      ? ''
      : `||'${config.defaultMode}'`;

  const load = config.persist?.custom
    ? `'${config.defaultMode}'`
    : !config.persist?.type || config.persist.type === 'cookie'
    ? `(function(c,i){for(;i<c.length;i++)if(!c[i].indexOf(${K}+'='))return c[i].substring(${(config.persist?.key ?? 'dark').length + 1})})(document.cookie.split('; '),0)${fallbackToDefault}`
    : `${config.persist.type}.getItem(${K})${fallbackToDefault}`;

  body.push(
    new RawNode(
      `function S(_){m=x(_);M.forEach(function(_){_(m)});if(H)q.removeEventListener(${C},H);H=0;if(m==${X}){H=h;q.addEventListener(${C},H);s(m==${X}?q.matches?${d}:${l}:m)}else s(m)${saveFuncName ? `;${saveFuncName}()` : ''}}`
    )
  );
  body.push(new RawNode(`function h(e){s([${l},${d}][+e.matches])}`));

  body.push(new RawNode(`S(${load});`));
  if (saveFuncName) body.push(new RawNode(`q.addEventListener(${C},${saveFuncName});`));
  body.push(new RawNode(`return{getMode:function(){return m},getTheme:function(){return t},setMode:S,watchMode:function(l,w){w=function(_){l(_)};w(m);M.push(w);return function(i){i=M.indexOf(w);i>=0&&M.splice(i,1)}},watchTheme:function(l,w){w=function(_){l(_)};w(t);T.push(w);return function(i){i=T.indexOf(w);i>=0&&T.splice(i,1)}}}`));

  const func = new FunctionNode(vm.params, body);
  return `;window['${addslashes(config.variableName)}']=${func.print()}(${vm.args.join(',')});`;
}

export async function generate(
  config: ModeCodegenConfig,
  output = 'mode.js'
): Promise<void> {
  await writeFile(output, generateCode(config));
}

export async function generateFromFile(
  configPath = './mode.config.json',
  output = 'mode.js'
): Promise<void> {
  const config = JSON.parse(
    (await readFile(configPath)).toString()
  ) as ModeCodegenConfig;
  await generate(config, output);
}
