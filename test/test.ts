import { mkdtemp, writeFile, rm, readFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import os from 'os';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('generated file sets variable', async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'mode-'));
  try {
    const config = { variableName: 'myDarkMode' };
    await writeFile(path.join(tmp, 'mode.config.json'), JSON.stringify(config));
    const result = spawnSync(process.execPath, [path.resolve(__dirname, '../bin.js')], { cwd: tmp });
    assert.strictEqual(result.status, 0, result.stderr?.toString() || 'process failed');
    const output = await readFile(path.join(tmp, 'mode.js'), 'utf8');
    assert.match(output, /window\['myDarkMode'\]/, 'variable not initialized correctly');
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});
