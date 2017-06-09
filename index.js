#!/usr/bin/env node

const { execSync } = require('child_process');

const current = execSync('git branch | grep \"^\\*\" | cut -b 3-', { encoding: 'utf8' });
const shownBranches = execSync('git show-branch -a --sha1-name', { encoding: 'utf8' }).split(/\n/);
const separatorIndex = shownBranches.findIndex((b) => /^--/.test(b));
const branches = [];
const currentHash = execSync(`git rev-parse ${current}`, { encoding: 'utf8' }).replace('\n', '');

let currentIndex;
let baseHash = '';

shownBranches.slice(0, separatorIndex)
  .forEach((b, i) => {
    const name = b.replace(/\].+/, '').match(/\[(.+)/)[1];
    if (!name) return;
    if (b[i] === '*') currentIndex = i;
    branches.push(name);
  });

shownBranches
  .slice(separatorIndex + 1, shownBranches.length - 1)
  .filter(b => {
    const [status, branch] = b.replace(/\].+/, '').split('[');
    const isCurrent = status[currentIndex] === '*' || status[currentIndex] === '-';
    if (!isCurrent) return;
    return [...status]
      .map((s, i) => {
        if (i === currentIndex) return;
        if (s === ' ') return;
        const name = branches[i];
        const hash = execSync(`git rev-parse ${name}`, { encoding: 'utf8' }).replace('\n', '');
        if (hash === currentHash) return;
        return true;
      })
      .filter(s => !!s).length;
  })
  .map(b => b.replace(/\].+/, '').match(/\[(.+)/)[1])
  .some(hash => {
    try {
      execSync(`git checkout --force ${hash}`);
      let result;
      result = execSync(`git merge-base --fork-point ${current}`, { encoding: 'utf8' });
    } catch (e) {
      // nop
    }
    baseHash = result;
    return !!result;
  });

execSync(`git checkout ${current}`);

process.stdout.write(baseHash.trim());
