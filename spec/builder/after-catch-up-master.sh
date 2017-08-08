# *   merge master to feat-x
# |\
# | * master1  <-- expected
# * | x2
# * | x1
# |/
# * second commit
# * first commit


# *   aca0da9 merge master to feat-x
# |\
# | * 5ebe771 master1
# * | deecf0e x2
# * | 95867ad x1
# |/
# * 30c203c second commit
# * faed570 first commit
cd spec
rm -rf fixtures/after-catch-up-master
git init
git commit --allow-empty -m "first commit"
git commit --allow-empty -m "second commit"
git checkout -b feat-x
git commit --allow-empty -m "x1"
git commit --allow-empty -m "x2"
git checkout master
git commit --allow-empty -m "master1"
git tag "expected"
git checkout feat-x
git merge master --no-ff -m "merge master to feat-x"
mv .git fixtures/after-catch-up-master
rm -rf .git
