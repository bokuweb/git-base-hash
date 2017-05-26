#!/usr/bin/env node

const { execSync } = require('child_process');

const target = process.argv[2];

if (!target) {
  console.error('please specify target branch name');
  process.exit(1);
}

// git branch &> /dev/null | grep \"^\\*\" | cut -b 3-'

const current = execSync('git branch | grep \"^\\*\" | cut -b 3-', { encoding: 'utf8' });
console.log(current)

// execSync(`git checkout ${current}`);


