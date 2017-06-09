import test from 'ava';
import { execFile, execSync } from 'child_process';
import process from 'process';

process.chdir('spec/fixtures/fixture0');

test.beforeEach(t => {
  console.log(execSync('git status');)
  execSync('git checkout topic');
});

/* Test case 0

- result of show-branch

! [bravo] bravo1
 ! [master] master1
  * [topic] topic2
---
  * [c8da61d] topic2
 +* [fe903eb] master1
  * [c3f7cf7] topic1
+ * [dd12339] bravo1
++* [5e7fab3] init

- result of log --graph

* c8da61d - (HEAD -> topic) topic2 (18 minutes ago) <bokuweb>
*   d0c5c98 - merge 'master' into topic (19 minutes ago) <bokuweb>
|\
| * fe903eb - (master) master1 (22 minutes ago) <bokuweb>
* | c3f7cf7 - topic1 (20 minutes ago) <bokuweb>
* | dd12339 - (bravo) bravo1 (21 minutes ago) <bokuweb>
|/
* 5e7fab3 - init (23 minutes ago) <bokuweb>

*/

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

