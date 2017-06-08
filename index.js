#!/usr/bin/env node

const { execSync } = require('child_process');

const current = execSync('git branch | grep \"^\\*\" | cut -b 3-', { encoding: 'utf8' });
let baseHash;

execSync('git show-branch -a --sha1-name | grep "*" | grep "+"', { encoding: 'utf8' })
  .split(/\n/)
  .map(commit => {
    if (!commit) return;
    return commit.replace(/\].+/, '').match(/\[(.+)/)[1];
  })
  .some(hash => {
    execSync(`git checkout ${hash}`);
    let result;
    try {
      result = execSync(`git merge-base --fork-point ${current}`, { encoding: 'utf8' });
    } catch (e) {
      // nop
    }
    baseHash = result;
    return !!result;
  });

execSync(`git checkout ${current}`);
process.stdout.write(baseHash.trim());
