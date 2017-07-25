const { Repository } = require('tiny-commit-walker');

module.exports.detectBaseHash = (dir, branchName) => {
  const gitDir = Repository.findGitDirSync(dir);
  const repo = new Repository(gitDir);

  let targetCommit;
  if (branchName) {
    targetCommit = repo.readCommitByBranchSync(branchName);
  } else {
    const head = repo.readHeadSync();
    if (head.type === 'commit') throw new Error('HEAD is not a ref to branch.');
    branchName = head.branch.name;
    targetCommit = head.branch.commit;
  }

  const commits = repo
    .readBranchesSync()
    .filter(b => b.name !== branchName)
    .map(b => b.commit);

  const hashDict = {};
  commits.forEach(c => hashDict[c.hash] = true);

  function setupHashes(commit) {
    hashDict[commit.hash] = true;
    if (commit.hasParents) {
      commit.parentHashes.filter(hash => !hashDict[hash]).forEach(hash => {
        try {
          setupHashes(commit.walkSync(hash));
        } catch (err) { }
      });
    }
  }
  commits.forEach(setupHashes);

  let baseHash = "";
  let commit = targetCommit;

  while (true) {
    if (hashDict[commit.hash]) {
      baseHash = commit.hash;
      break;
    }
    if (commit.isMergeCommit) {
      baseHash = commit.mergedParentHashes[0];
      break;
    }
    if (!commit.hasParents) {
      break;
    }
    commit = commit.walkSync();
  }

  return baseHash;
};