#!/usr/bin/env node

const { exec } = require('child_process');
const { quote } = require('shell-quote');

const target = process.argv[2];

if (!target) {
  console.error('please specify target branch name');
  process.exit(1);
}

const promisedExec = (commands) => new Promise((resolve, reject) => {
  const command = quote(commands);
  exec(command, (err, stdout, stderr) => {
    if (err) reject({ err, stderr });
    resolve(stdout);
  });
});

promisedExec(['git', 'checkout', target])
  .then((branch) => {
    process.stdout.write(branch);
  });

