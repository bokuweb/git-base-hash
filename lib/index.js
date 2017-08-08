const { Repository } = require('tiny-commit-walker');


const findBaseHash = (hashDict, commit) => {
  let next;
  console.log(hashDict)
  while (true) {
    const c = next || commit;
    console.log(c.hash)
    if (hashDict[c.hash]) return c.hash;
    // ??
    // if (c.isMergeCommit) {
    // console.log('a')
    // return c.mergedParentHashes[0];
    // }
    if (!c.hasParents) return;
    next = c.walkSync();
  }
};

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

  const [firstParentBranch, ...branches] = repo
    .readBranchesSync()
    .filter(b => b.name !== branchName)
    .map(b => b.commit);

  const firstParentHashDict = {};
  const otherHashDict = {};
  const setupHashes = (commit) => {
    // firstParentHashDict[commit.hash] = true;
    if (commit.hasParents) {
      const [first, ...other] = commit.parentHashes;
      firstParentHashDict[first] = true;
      // const hash = commit.parentHashes[0]; //.filter(hash => !hashDict[hash]).forEach(hash => {
      commit.parentHashes.filter(hash => !otherHashDict[hash] || !firstParentHashDict[hash]).forEach(hash => {
        otherHashDict[commit.hash] = true;
        try {
          setupHashes(commit.walkSync(hash));
        } catch (err) { }
      });
    }
  };
  firstParentHashDict[firstParentBranch.hash] = true;
  // const setupHashes = (commit) => {
  //   // firstParentHashDict[commit.hash] = true;
  //   if (commit.hasParents) {
  //     const [first, ...other] = commit.parentHashes;
  //     firstParentHashDict[first] = true;
  //     // const hash = commit.parentHashes[0]; //.filter(hash => !hashDict[hash]).forEach(hash => {
  //     commit.parentHashes.filter(hash => !otherHashDict[hash] || !firstParentHashDict[hash]).forEach(hash => {
  //       try {
  //         setupHashes(commit.walkSync(hash));
  //       } catch (err) { }
  //     });
  //   }
  // };
  setupHashes(firstParentBranch);
  console.log(firstParentHashDict);
  // const setupHashes = (commit) => {
  //   // otherHashDict[commit.hash] = true;
  //   if (commit.hasParents) {
  //     commit.parentHashes.filter(hash => !otherHashDict[hash] || !firstParentHashDict[hash]).forEach(hash => {
  //       try {
  //         setupHashes(commit.walkSync(hash));
  //       } catch (err) { }
  //     });
  //   }
  // };
  branches.forEach((b) => {
    otherHashDict[b.hash] = true;
    setupHashes(b);
  });

  return findBaseHash(firstParentHashDict, targetCommit);
};