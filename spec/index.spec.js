import test from 'ava';
import { execFile, execSync } from 'child_process';
var process = require('process');
process.chdir('spec/fixtures/fixture0');

// execSync('cd spec/fixtures/fixture0');

// console.log(execSync('git status', { encoding: 'utf8' }));
console.log(execSync('ls', { encoding: 'utf8' }));

test.beforeEach(t => {
  execSync('git checkout topic');
});

test.serial('', async t => {
  const stdout = await new Promise((resolve) => {
    execFile('../../../index.js', (error, stdout) => {
      if (error) console.error(error);
      console.log(stdout)
      resolve(stdout)
    });
  });
  t.is(stdout, "dd1233980a2410cc1d25ad776fe77207725bec2d");
});

test.afterEach(t => {
  execSync('git checkout topic');
})

