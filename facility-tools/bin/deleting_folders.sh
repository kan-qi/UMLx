#!/bin/bash
# while IFS='' read -r line || [[ -n "$line" ]]; do
while IFS='' read -r line ; do
#	echo $line
     echo "DELETING FOLDER AND SUB-FOLDERS IN " $line
    # bash -c "ls -lrt $line"
     bash -c "rm -rf $line"
done < "sample.txt"
