#!/usr/bin/env node

const { execSync } = require('child_process');

// const target = process.argv[2];

// if (!target) {
//   console.error('please specify target branch name');
//   process.exit(1);
// }

const current = execSync('git branch | grep \"^\\*\" | cut -b 3-', { encoding: 'utf8' });
// execSync(`git checkout ${target}`);
const shownBranches = execSync('git show-branch -a --sha1-name', { encoding: 'utf8' }).split(/\n/);
// execSync(`git checkout ${current}`);
console.log(shownBranches);
const separatorIndex = shownBranches.indexOf('--');
const branches = shownBranches.slice(0, separatorIndex)
  .map((b, i) => {
    const name = b.match(/\[(.+)\]/)[1];
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
console.log(branches);
console.log(commits);

const baseShortHash = commits.find(c => {
  const [status, branch] = c.replace(/\].+/, '').split('[');
  // console.log(status, branch)
  const isCurrent = status[currentIndex] === '*' || status[currentIndex] === '-';
  // console.log(isCurrent);
  if (!isCurrent) return;
  const length = [...status].map((s, i) => {
    if (i === currentIndex) return;
    if (s === ' ') return;
    console.log(s)
    const { name } = branches[i];
    console.log(name)
    const hash = execSync(`git rev-parse ${name}`, { encoding: 'utf8' }).replace('\n', '');
    console.log(hash)
    if (hash === currentHash) return;
    return true;
  }).filter(s => !!s).length;
  return length;
  // const otherIndexes = status.map((s, i) => {
  //   if (s === '+' || s === '!') return i;
  // }).filter(s => !!s);
}).match(/\[(.+)\]/)[1];
console.log(baseShortHash)


const baseHash = execSync(`git rev-parse ${baseShortHash}`, { encoding: 'utf8' }).replace('\n', '');

process.stdout.write(baseHash);