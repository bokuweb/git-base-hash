# git-base-hash

git-base-hash detects tge parent branch.

## Install

```
$ npm install --save git-base-hash
```

or global install

```
$ npm install -g git-base-hash
$ git-base-hash -h
```

## Usage

```js
import { detectBaseHash } from 'git-base-hash';

console.log(detectBaseHash('path/to/repo'));
console.log(detectBaseHash('path/to/repo', 'foo-branch'));
```