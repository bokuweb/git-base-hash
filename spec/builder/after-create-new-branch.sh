cd spec
rm -rf fixtures/after-create-new-branch
git init
git commit --allow-empty -m "first commit"
sleep 1s
git checkout -b feat-x
git checkout master
git commit --allow-empty -m "second commit"
sleep 1s
git tag "expected"
git checkout feat-x
git commit --allow-empty -m "x1"
sleep 1s
git commit --allow-empty -m "x2"
sleep 1s
# git checkout master
git commit --allow-empty -m "x3"
sleep 1s
# git checkout feat-x
git merge master --no-ff -m "merge master to feat-x"
git checkout master
# git reset --soft HEAD~1
git checkout -b feat-y
git show-branch -a --sha1-name
mv .git fixtures/after-create-new-branch
rm -rf .git