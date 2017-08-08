import test from 'ava';
import { execFile, execSync } from 'child_process';
import process from 'process';
import { detectBaseHash } from '../lib/index';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as cpx from 'cpx';

const specs = [
  'master-to-catch-up-branch',
];

specs.map(spec => {
  cpx.copySync(path.resolve(__dirname, 'fixtures', spec), path.resolve(__dirname, '.git'));
  // execSync(`mv ${path.resolve(__dirname, 'fixtures', spec)} ${path.resolve(__dirname, '.git')}`);

  test.serial(spec, async t => {
    const a = detectBaseHash(__dirname);
    console.log(a);
    t.pass();
  });
})

test.afterEach(() => {
  rimraf.sync(path.resolve(__dirname, '.git'));
})



