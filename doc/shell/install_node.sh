#!/bin/sh
# Common dependences
# yum -y install pcre-devel openssl openssl-devel
# yum -y install zlib zlib-devel
# yum -y install gcc-c++
# 
# # fix 'make' Command not Found
# yum -y install gcc automake autoconf libtool make
# 
# # install python
# cd /tmp/
# wget http://python.org/ftp/python/2.7.3/Python-2.7.3.tar.bz2
# tar -jxvf Python-2.7.3.tar.bz2
# 
# cd Python-2.7.3/
# ./configure
# make & make install & make clean & make distclean
# mv /usr/bin/python /usr/bin/python2.4.3
# ln -s /usr/local/bin/python2.7 /usr/bin/python
# # keep python version in yum
# vi /usr/bin/yum
# # change  #!/usr/bin/python  -->  #!/usr/bin/python2.4.3
# 
# # fix "No module named bz2"
# yum install -y bzip2*

# Install NodeJS 
nodeVersion=$1

if [ $# -eq 0 ]
    then
    echo "please specify node version args, like 'v0.10.00'."
    exit 1
fi

filename="node-$nodeVersion.tar.gz"
downloadLink="http://nodejs.org/dist/$nodeVersion/$filename"

if [ -e "./$filename" ]
	then
	echo "$filename found."
else
	wget $downloadLink 
fi

tar -zxvf $filename
cd node-$nodeVersion 
./configure
sudo make
sudo make install

# Install NPM 
curl https://npmjs.org/install.sh | sh

