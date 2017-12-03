#!/bin/bash
# This script takes arguments : repositorySources
repositorySources=$1

echo "$repositorySources"
#echo "$skipList" > skipList.txt
#echo "$repositories" > repositories1.txt

if [[ -e "temp/skipList.txt" ]];
then "rm temp/skipList.txt"
fi

if [[ -e "temp/repositories.txt" ]];
then rm "temp/repositories.txt"
fi

while read -r line; do
if [[ $line =~ ^\- ]];
then
    echo "$line" >> "temp/skipList.txt"
else
	echo "$line" >> "temp/repositories.txt"
fi
done < "$repositorySources"

while read -r line; do
	path="${line//\\/\/}"
	echo "$path"
   	find "$path"  |grep -v '/$' |tee "$path/filelist.txt"
   	echo "$path/filelist.txt"
 #  	if [ "$skipList" == "${skipList%$line*}" ]; then
 #  continue
 #	fi
#    mkdir "$resultDir/$d"
#    $ucc -i1 "$d/filelist.txt" -outdir "$resultDir/$d"
#    $cloc --list-file="$d/filelist.txt" --report-file="$resultDir/$d/clocmetrics.csv" 
done < "temp/repositories.txt"