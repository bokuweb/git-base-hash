import test from 'ava';
import { execFile, execSync } from 'child_process';
import process from 'process';

process.chdir('fixture');

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

test.serial('should get expected hash', async t => {
  execSync('git checkout topic');
  const stdout = await new Promise((resolve) => {
    execFile('../index.js', (error, stdout) => {
      if (error) console.error(error);
      resolve(stdout)
    });
  });
  t.is(stdout, "dd1233980a2410cc1d25ad776fe77207725bec2d");
});

*/

/* Test case 1

- result of show-branch

* [char] char3
 ! [delta] delta1
  ! [master] master1
   ! [topic] topic2
    ! [origin/HEAD] master1
     ! [origin/bravo] bravo1
      ! [origin/char] char3
       ! [origin/delta] delta1
        ! [origin/master] master1
         ! [origin/topic] topic2
----------
*     +    [a093a44] char3
-     -    [e808760] Merge branch 'delta' into char
*+    ++   [53e1adb] delta1
*     +    [68da824] char2
*+    ++   [341e9f1] char1
*+ +  ++ + [c8da61d] topic2
-- -  -- - [d0c5c98] merge 'master' into topic
*++++ ++++ [fe903eb] master1
*+ +  ++ + [c3f7cf7] topic1
*+ + +++ + [dd12339] bravo1
*+++++++++ [5e7fab3] init

- result of log --graph

* a093a44 - (origin/char, char) char3 (2 minutes ago) <bokuweb>
*   e808760 - Merge branch 'delta' into char (2 minutes ago) <bokuweb>
|\
| * 53e1adb - (HEAD -> delta, origin/delta) delta1 (3 minutes ago) <bokuweb>
* | 68da824 - char2 (3 minutes ago) <bokuweb>
|/
* 341e9f1 - char1 (4 minutes ago) <bokuweb>
* c8da61d - (origin/topic, topic) topic2 (25 hours ago) <bokuweb>
*   d0c5c98 - merge 'master' into topic (25 hours ago) <bokuweb>
|\
| * fe903eb - (origin/master, origin/HEAD, master) master1 (25 hours ago) <bokuweb>
* | c3f7cf7 - topic1 (25 hours ago) <bokuweb>
* | dd12339 - (origin/bravo) bravo1 (25 hours ago) <bokuweb>
|/
* 5e7fab3 - init (26 hours ago) <bokuweb>
*/

test.serial('should get expected hash', async t => {
  execSync('git checkout char');
  const stdout = await new Promise((resolve) => {
    execFile('../index.js', (error, stdout) => {
      if (error) console.error(error);
      resolve(stdout)
    });
  });
  t.is(stdout, "53e1adbcb5d8c35f8b3165b338a49ef77497c35f");
});
