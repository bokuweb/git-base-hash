#!/usr/bin/env node

const { execSync } = require('child_process');

const current = execSync('git branch | grep \"^\\*\" | cut -b 3-', { encoding: 'utf8' });
const shownBranches = execSync('git show-branch -a --sha1-name', { encoding: 'utf8' }).split(/\n/);
const separatorIndex = shownBranches.findIndex((b) => /^--/.test(b));
const branches = shownBranches.slice(0, separatorIndex)
  .map((b, i) => {
    const name = b.replace(/\].+/, '').match(/\[(.+)/)[1];
    return {
      order: i,
      name,
      isCurrent: b[i] === '*',
      hash: execSync(`git rev-parse ${name}`, { encoding: 'utf8' }).replace('\n', ''),
    }
  });
const currentIndex = branches.find(b => b.isCurrent).order;
const currentHash = branches[currentIndex].hash;
const commits = shownBranches.slice(separatorIndex + 1, shownBranches.length - 1);
const baseShortHash = commits.find(c => {
  const [status, branch] = c.replace(/\].+/, '').split('[');
  const isCurrent = status[currentIndex] === '*' || status[currentIndex] === '-';
  if (!isCurrent) return;
  const length = [...status].map((s, i) => {
    if (i === currentIndex) return;
    if (s === ' ') return;
    const { name } = branches[i];
    const hash = execSync(`git rev-parse ${name}`, { encoding: 'utf8' }).replace('\n', '');
    if (hash === currentHash) return;
    return true;
  }).filter(s => !!s).length;
  return length;
}).match(/\[(.+)\]/)[1];

const baseHash = execSync(`git rev-parse ${baseShortHash}`, { encoding: 'utf8' }).replace('\n', '');

process.stdout.write(baseHash);