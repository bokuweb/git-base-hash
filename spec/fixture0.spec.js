import test from 'ava';
import { execFile, execSync } from 'child_process';
import process from 'process';

process.chdir('spec/fixtures/fixture0');

test.beforeEach(t => {
  execSync('git checkout topic');
});

test.serial('should get expected hash', async t => {
  const stdout = await new Promise((resolve) => {
    execFile('../../../index.js', (error, stdout) => {
      if (error) console.error(error);
      resolve(stdout)
    });
  });
  t.is(stdout, "dd1233980a2410cc1d25ad776fe77207725bec2d");
});

test.afterEach(t => {
  execSync('git checkout topic');
})

