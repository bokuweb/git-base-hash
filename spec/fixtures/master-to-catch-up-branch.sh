cd spec
echo "11"
git init
git commit --allow-empty -m "first commit"
git checkout -b feat-x
git commit --allow-empty -m "x1"
git commit --allow-empty -m "x2"
git tag "expected"
git checkout master
git commit --allow-empty -m "master1"
git commit --allow-empty -m "master2"
git checkout -b master2x feat-x
git merge master -m "merge master to feat-x"
mv .git fixtures/master-to-catch-up-branch
rm -rf .git