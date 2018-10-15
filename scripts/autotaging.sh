#!/bin/sh
lines=`git log --pretty="%H:%s" --reverse`
for line in `echo $lines`; do 
  commit=`echo $line| awk -F: '{print$1}'`
  title=`echo $line| awk -F: '{print$2}'`
  version=`echo $title| sed -ne 's/[^0-9]*\(\([0-9]\.\)\)/\1/p'`
  if [ "$version" == "1." ]; then
    continue;
  fi
  if [ "$version" != "" ]; then
    echo "[$version] Got Tag commit $commit $title"
    git tag "$version" $commit
    if [ $? != 0 ]; then
      echo "dublication, remove and add again"
      git tag -d "$version"
      git tag "$version" $commit
    fi
  fi
done

git push --tags
