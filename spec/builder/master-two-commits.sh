cd spec
rm -rf fixtures/master-two-commits
git init
git commit --allow-empty -m "first commit"
git commit --allow-empty -m "two commit"
mv .git fixtures/master-two-commits
rm -rf .git