#!/usr/bin/env node

const { exec } = require('child_process');
const { quote } = require('shell-quote');

if (!process.argv[2]) {
  console.error('please specify target branch name');
  process.exit(1);
}

const promisedExec = (commands) => new Promise((resolve, reject) => {
  const command = quote(commands);
  exec(command, { cwd: projectRoot }, (err, stdout, stderr) => {
    if (err) reject({ err, stderr });
    resolve(stdout);
  });
});

promisedExec(['git', 'checkout', '-b', process.argv[2]])
  .then((branch) => {
    process.stdout.write(branch);
  });

