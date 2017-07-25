#!/usr/bin/env node

const { detectBaseHash } = require('./lib');

const argv = require('yargs')
  .option('repository', {
    describe: 'Path to the repository (default is the current working directory).',
    default: process.cwd(),
  })
  .option('branch', {
    describe: 'target branch name (default is the current branch).',
    default: "",
  })
  .alias('r', 'repository')
  .alias('b', 'branch')
  .usage('git-base-hash --repository=path/to/repo --branch=foo')
  .help('h')
  .alias('h', 'help')
  .argv;

if (argv.h) {
  process.stdout.write(argv.h);
  return;
}

process.stdout.write(detectBaseHash(argv.repository, argv.branch));
