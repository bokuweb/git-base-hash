#!/usr/bin/env node

const { Repository } = require('tiny-commit-walker');

const repo = new Repository(process.cwd());
const head = repo.readHeadSync();
if (head.type === 'commit') {
  throw new Error('HEAD is not a ref to branch.');
}
const commits = repo
  .readBranchesSync()
  .filter(b => b.name !== head.branch.name)
  .map(b => b.commit);

const hashDict = {};

function setupHashes(commit) {
  if (hashDict[commit.hash]) return;
  hashDict[commit.hash] = true;
  if (commit.hasParents) {
    commit.parentHashes.forEach(hash => {
      try {
        setupHashes(commit.walkSync(hash));        
      } catch (err) { }
    });
  }
}

commits.forEach(setupHashes);

let baseHash;
let commit = head.branch.commit;

while(commit.hasParents) {
  if (hashDict[commit.hash]) {
    baseHash = commit.hash;
    break;
  }
  if (commit.isMergeCommit) {
    baseHash = commit.mergedParentHashes[0];
    break;
  }
  commit = commit.walkSync();
}

process.stdout.write(baseHash);
