import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { compileFunction } from 'node:vm';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');

/** Compile actual project modules; replace only I/O boundaries supplied by a fixture. */
export function sourceLoader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(name, parent = resolve(root, 'src/index.ts')) {
    if (name === 'server-only') return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    const filename = name.startsWith('@/') ? resolve(root, 'src', name.slice(2) + '.ts')
      : name.startsWith('.') && /\.tsx?$/.test(name) ? resolve(dirname(parent), name) : null;
    if (!filename) return createRequire(parent)(name);
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const module = { exports: {} }; cache.set(filename, module);
    compileFunction(source, ['require','module','exports',...Object.keys(globals)], { filename })(specifier => load(specifier, filename), module, module.exports,...Object.values(globals));
    return module.exports;
  }
  return load;
}
