#!/bin/bash
repositoryDir=$1
resultDir=$2
repositoryList=$3
ucc="ucc_bin/UCC.exe"
cloc="cloc/cloc-1.64.exe"
repositories=""
skipList=""
if [ -z "$repositoryDir" ]
then
	repositoryDir="."
fi
if [[ "$repositoryDir" == "/" ]]
	then
	repositoryDir=""
fi
if [ -z "$resultDir" ]
	then
	resultDir="./results"
fi
while read -r line; do
if [[ $line =~ ^\- ]];
then
    echo "$line" >> skipList.txt
else
	echo "$line" >> repositories.txt
fi
done < "$repositoryList"
repositories < repositories.txt
if [ -z "$repositories" ]
then
	for d in "$repositoryDir"/*/ ; do
#		echo "$repositoryDir$d" >> repositories.txt
	echo "hello"
	done
fi
echo "$repositoryDir"
echo "$resultDir"
#echo "$skipList" > skipList.txt
#echo "$repositories" > repositories1.txt
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
done < "repositories.txt"