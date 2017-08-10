const { Repository } = require('tiny-commit-walker');

const createFirstParentsDict = (targetCommit, targetHash) => {
  const firstParentHashDict = {};
  const setupParentsHashes = (commit) => {
    if (!commit || !commit.hasParents) return;
    if (targetCommit.hash !== commit.hash) firstParentHashDict[commit.hash] = true;
    const first = commit.parentHashes[0];
    try {
      setupParentsHashes(commit.walkSync(first));
    } catch (err) { }
  };
  setupParentsHashes(targetHash);
  return firstParentHashDict;
};

const createParentsDict = (targetCommit, branches) => {
  const otherHashDict = {};
  const setupHashes = (commit) => {
    if (!commit || !commit.hasParents) return;
    if (targetCommit.hash !== commit.hash) otherHashDict[commit.hash] = true;
    commit.parentHashes
      .filter(hash => !otherHashDict[hash])
      .forEach(hash => {
        try {
          setupHashes(commit.walkSync(hash));
        } catch (err) { }
      });
  };
  branches.forEach((b) => setupHashes(b));
  return otherHashDict;
};


const findBaseHash = ({ firstParents, otherParents }, targetCommit) => {
  console.log(targetCommit.hash)
  const find = (dict /*, a */) => {
    const commits = [];
    const setupHashes = (commit) => {
      if (!commit || !commit.hasParents) return;
      commit.parentHashes
        .forEach(hash => {
          commits.push(commit);
          try {
            setupHashes(commit.walkSync(hash));
          } catch (err) { }
        });
    };
    setupHashes(targetCommit);
    commits.sort((a, b) => a.committer.date < b.committer.date ? 1 : -1);
    console.log('a')
    console.log(commits.map(c => c.hash))
    console.log(firstParents)

    let found = commits.find((c => firstParents[c.hash]));
    if (found) return found.hash;
    found = commits.find((c => c.isMergeCommit || otherParents[c.hash]));
    if (found) return found.hash;
    return null;

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

const createCandidates = (targetCommit, [first, ...others]) => {
  return {
    firstParents: createFirstParentsDict(targetCommit, first),
    otherParents: createParentsDict(targetCommit, others),
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
  if (!head || head.type === 'commit') return null;
  const branchName = head.branch.name;
  const targetCommit = head.branch.commit;
  const branches = repo
    .readBranchesSync()
    .filter(b => b.name !== branchName)
    .map(b => b.commit);
  const candidates = createCandidates(targetCommit, branches);
  return findBaseHash(candidates, targetCommit);
};