#!/bin/sh
# Install ablejs
ablejsDir="ablejs"

cd /tmp/
if [ -d "$ablejsDir" ]
	then
	echo "$ablejsDir directory found."
else
	git clone https://github.com/ablesky/ablejs.git 
fi

npm install -g ablejs

rm -rf $ablejsDir

