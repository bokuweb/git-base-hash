import test from 'ava';
import { execSync } from 'child_process';
import process from 'process';
import { detectBaseHash } from '../lib/index';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as cpx from 'cpx';

process.chdir('spec');

const specs = [
  'master-to-catch-up-branch',
];

specs.map(spec => {
  cpx.copySync(path.resolve(__dirname, 'fixtures', spec), path.resolve(__dirname, '.git'));

  test.serial(spec, async t => {
    const baseHash = detectBaseHash(__dirname);
    const expected = execSync('git show-ref --tag', { encoding: "utf8" }).split(' ')[0];
    t.is(expected, baseHash);
  });
})

test.afterEach(() => {
  // rimraf.sync(path.resolve(__dirname, '.git'));
})



