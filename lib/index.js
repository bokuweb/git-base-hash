const { Repository } = require('tiny-commit-walker');


const findBaseHash = ({ firstParents, otherParents }, commit) => {
  const find = (dict) => {
    let next = [];
    while (true) {
      const parents = [];
      const commits = next.length ? next : [commit];
      for (const c of commits) {
        if (dict[c.hash]) return c.hash;
        if (!c.hasParents) continue;
        parents.push(...c.parentHashes);
      }
      if (!parents.length) return;
      next = parents.map(p => commit.walkSync(p));
    }
  };
  return find(firstParents) || find(otherParents);
};

const createCandidates = ([firstParentBranch, ...branches]) => {
  const firstParentHashDict = {};
  const otherHashDict = {};
  const setupHashes = (commit) => {
    if (!commit.hasParents) return;
    const [first, ...other] = commit.parentHashes;
    firstParentHashDict[first] = true;
    commit.parentHashes
      .filter(hash => !otherHashDict[hash] && !firstParentHashDict[hash])
      .forEach(hash => {
        otherHashDict[commit.hash] = true;
        try {
          setupHashes(commit.walkSync(hash));
        } catch (err) { }
      });
  };
  firstParentHashDict[firstParentBranch.hash] = true;
  setupHashes(firstParentBranch);
  branches.forEach((b) => {
    otherHashDict[b.hash] = true;
    setupHashes(b);
  });
  return {
    firstParents: firstParentHashDict,
    otherParents: otherHashDict,
  };
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
  const branches = repo
    .readBranchesSync()
    .filter(b => b.name !== branchName)
    .map(b => b.commit);
  const candidates = createCandidates(branches);
  return findBaseHash(candidates, targetCommit);
};