#!/bin/bash
if 
	[ $1 = "class" ] ;  
then
	echo "Generating class diagram..."
	$JAVA_HOME/bin/java -jar /Users/akshaymishra/Desktop/umlparser.jar class $2 $3	
elif 
	[ $1 = "sequence" ] ;	
then 
	echo "Generating sequence diagram..."
	$JAVA_HOME/bin/java -jar /Users/akshaymishra/Desktop/umlparser.jar seq $2 $3 $4 $5
fi;


