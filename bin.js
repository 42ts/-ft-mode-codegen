// @ts-check

const { readFile, writeFile } = require('fs/promises');

function validateMode(mode) {
  if (mode !== 'system' && mode !== 'dark' && mode !== 'light')
    throw new Error(`Invalid mode: ${mode}`);
}

function validatePersist(persist) {
  if (
    persist.type !== 'cookie' &&
    persist.type !== 'localStorage' &&
    persist.type !== 'localStorage'
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

function validateApply(apply) {
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

function validateConfig(config) {
  if (typeof config.variableName !== 'string')
    throw new Error('variable name must be a string');
  if (config.defaultMode !== undefined) validateMode(config.defaultMode);
  if (config.persist !== undefined) validatePersist(config.persist);
  if (config.apply !== undefined) validateApply(config.apply);
}

/** @param {string} str */
function addslashes(str) {
  return str.replace(/[\\"']/g, '\\$&');
}

(async () => {
  /** @type {import('./bin').ModeCodegenConfig} */
  const config = JSON.parse((await readFile('./mode.config.json')).toString());
  validateConfig(config);
  const fallbackToDefault =
    !config.defaultMode || config.defaultMode === 'system'
      ? ''
      : `||'${config.defaultMode}'`;
  const load = config.persist?.custom
    ? `'${config.defaultMode}'`
    : !config.persist?.type || config.persist.type === 'cookie'
    ? `(function(c,i){for(;i<c.length;i++)if(!c[i].indexOf(K+'='))return c[i].substring(${
        (config.persist?.key ?? 'dark').length + 1
      })})(document.cookie.split('; '),0)${fallbackToDefault}`
    : `${config.persist.type}.getItem(K)${fallbackToDefault}`;
  const apply =
    config.apply === 'custom'
      ? ''
      : `_=document.querySelector('${addslashes(
          config.apply?.querySelector ?? 'html'
        )}').classList;if(t==d)_.add(y);else _.remove(y)${
          config.apply?.lightClassName
            ? `;if(t==l)_.add(Y);else _.remove(Y)`
            : ''
        }`;
  const saveFuncName = '$';
  const saveFunc = config.persist?.custom
    ? ''
    : !config.persist?.type || config.persist.type === 'cookie'
    ? `function ${saveFuncName}(){document.cookie=K+'='+m+'; path=/'${
        config.persist?.cookieSystemThemeKey
          ? `;document.cookie='${addslashes(config.persist.cookieSystemThemeKey)}='+(q.matches?d:l)+'; path=/'`
          : ''
      }}`
    : `function ${saveFuncName}(){${config.persist.type}.setItem(K,m)}`;
  writeFile(
    'mode.js',
    // q = mediaQuery, m/t = current mode/theme, M/T = mode/theme watchers
    `;window['${addslashes(
      config.variableName
    )}']=(function(q,M,T,l,d,X,K,C,y,Y,m,t,H){` +
      // x = sanitizeMode
      `function x(_){return _==l||_==d?_:X}` +
      // s = setTheme
      `function s(_){t=_;T.forEach(function(_){_(t)});${apply}}` +
      // S = setMode
      `function S(_){m=x(_);M.forEach(function(_){_(m)});if(H)q.removeEventListener(C,H);H=0;if(m==X){H=h;q.addEventListener(C,H);s(m==X?q.matches?d:l:m)}else s(m)${
        saveFunc && `;${saveFuncName}()`
      }}` +
      // h = eventListener
      `function h(e){s([l,d][+e.matches])}` +
      saveFunc +
      `S(${load});` +
      (saveFunc && `q.addEventListener(C,${saveFuncName});`) +
      `return{` +
      `getMode:function(){return m},` +
      `getTheme:function(){return t},` +
      `setMode:S,` +
      `watchMode:function(l,w){w=function(_){l(_)};w(m);M.push(w);return function(i){i=M.indexOf(w);i>=0&&M.splice(i,1)}},` +
      `watchTheme:function(l,w){w=function(_){l(_)};w(t);T.push(w);return function(i){i=T.indexOf(w);i>=0&&T.splice(i,1)}}` +
      `}` +
      `})(window.matchMedia('(prefers-color-scheme: dark)'),[],[],'light','dark','system','${addslashes(
        config.persist?.key ?? ''
      )}','change'${
        config.apply !== 'custom'
          ? `,'${addslashes(config.apply?.darkClassName ?? 'dark')}'${
              config.apply?.lightClassName
                ? `,'${addslashes(config.apply.lightClassName)}'`
                : ''
            }`
          : ''
      });`
  );
})();
