const { Repository } = require('tiny-commit-walker');


const findBaseHash = ({ firstParents, otherParents }, commit) => {
  const find = (dict /*, a */) => {
    let next = [];
    const commits = [];

    let cs = [];
    const setupHashes = (commit) => {
      if (!commit.hasParents) return;
      commit.parentHashes
        .forEach(hash => {
          cs.push(commit);
          try {
            setupHashes(commit.walkSync(hash));
          } catch (err) { }
        });
    };
    setupHashes(commit);
    cs.sort((a, b) => {
      console.log(a.committer.date)
      return a.committer.date < b.committer.date ? 1 : -1;
    })// .map(c => c.hash);
    console.log('a')
    console.log(cs.map(c => c.hash))
    console.log(firstParents)

    for (const c of cs) {
      if (firstParents[c.hash]) return c.hash;
    }

    for (const c of cs) {
      if (c.isMergeCommit) return c.hash;
      if (otherParents[c.hash]) return c.hash;
    }
    // while (true) {
    //   const parents = [];
    //   const commits = next.length ? next : [commit];
    //   for (const c of commits) {
    //     if (dict[c.hash]) return c.hash;
    //     // if (c.isMergeCommit && a) return c.mergedParentHashes[0];
    //     if (!c.hasParents) continue;
    //     parents.push(...c.parentHashes);
    //   }
    //   if (!parents.length) return;
    //   next = parents.map(p => commit.walkSync(p)).sort((a, b) => a.committer.date < b.committer.date ? 1 : -1);
    // }
    // let a;
    // while (true) {
    //   const parents = [];
    //   const commits = next.length ? next : [commit];
    //   for (const c of commits) {
    //     if (dict[c.hash]) return c.hash;
    //     // if (c.isMergeCommit && a) return c.mergedParentHashes[0];
    //     if (!c.hasParents) continue;
    //     parents.push(...c.parentHashes);
    //   }
    //   if (!parents.length) return;
    //   next = parents.map(p => commit.walkSync(p)).sort((a, b) => a.committer.date < b.committer.date ? 1 : -1);
    // }
  };
  return find(firstParents) || find(otherParents);
};

const createCandidates = ([firstParentBranch, ...branches]) => {
  const firstParentHashDict = {};
  const otherHashDict = {};

  const setupParentsHashes = (commit) => {
    if (!commit.hasParents) return;
    const first = commit.parentHashes[0];
    firstParentHashDict[first] = true;
    try {
      setupParentsHashes(commit.walkSync(first));
    } catch (err) { }
  };

  const setupHashes = (commit) => {
    if (!commit.hasParents) return;
    // const [first, ...other] = commit.parentHashes;
    // console.log(first)
    // firstParentHashDict[first] = true;
    commit.parentHashes
      .filter(hash => !otherHashDict[hash] && !firstParentHashDict[hash])
      .forEach(hash => {
        otherHashDict[hash] = true;
        try {
          setupHashes(commit.walkSync(hash));
        } catch (err) { }
      });
  };
  firstParentHashDict[firstParentBranch.hash] = true;
  setupParentsHashes(firstParentBranch);
  branches.forEach((b) => {
    otherHashDict[b.hash] = true;
    setupHashes(b);
  });
  return {
    firstParents: firstParentHashDict,
    otherParents: otherHashDict,
  };
};

module.exports.detectBaseHash = (dir) => {
  const gitDir = Repository.findGitDirSync(dir);
  const repo = new Repository(gitDir);
  let head;
  try {
    head = repo.readHeadSync();
  } catch (e) {
    return null;
  }
  if (head.type === 'commit') return null;
  const branchName = head.branch.name;
  const targetCommit = head.branch.commit;
  const branches = repo
    .readBranchesSync()
    .filter(b => b.name !== branchName)
    .map(b => b.commit);
  const candidates = createCandidates(branches);
  return findBaseHash(candidates, targetCommit);
};