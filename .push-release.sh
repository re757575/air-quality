#!/bin/bash

git config --global user.name "Alex.Dai (via Travis-CI)"
git config --global user.email "re757575@gmail.com"
git remote set-url origin https://${GH_TOKEN}@github.com/re757575/air-quality.git
git fetch --tags

export TIME_STR=`eval date`
export VERSION=`grep -Po '(?<="version": ")[^"]*' package.json`

if [ -z "${TRAVIS_TAG}" ]; then git tag $VERSION; fi
if [ -z "${TRAVIS_TAG}" ]; then git push --tags --quiet; fi

if [ -z "${TRAVIS_TAG}" ]; then cd www; git init; git remote add origin https://${GH_TOKEN}@github.com/re757575/air-quality.git; git add .; git commit -a -m "Travis CI build on $TIME_STR [ci skip]"; git push -u --quiet origin -f master:gh-pages; cd ../; fi