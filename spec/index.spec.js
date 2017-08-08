import test from 'ava';
import { execSync } from 'child_process';
import process from 'process';
import { detectBaseHash } from '../lib/index';
import * as path from 'path';
import * as glob from 'glob';
import * as rimraf from 'rimraf';

process.chdir('spec');

test.afterEach.always(() => {
  rimraf.sync(path.resolve(__dirname, '.git'));
});

const copyGitFiles = (name) => {
  execSync(`cp -r ${path.resolve('fixtures', name)} ${path.resolve('./', '.git')}`);
};

const specs = glob.sync('fixtures/*').map(spec => {
  const dirs = spec.split(path.sep);
  return dirs[dirs.length - 1];
});


specs.forEach((spec) => {

  if (spec === 'no-commit') {
    test.serial(spec, t => {
      copyGitFiles(spec);
      const baseHash = detectBaseHash(__dirname);
      t.is(null, baseHash);
    });
    return;
  }
  test.serial(spec, t => {
    copyGitFiles(spec);
    const baseHash = detectBaseHash(__dirname);
    console.log('base')
    console.log(baseHash);
    const expected = execSync('git rev-parse expected', { encoding: "utf8" }).trim();
    t.is(expected, baseHash);
  });
});
