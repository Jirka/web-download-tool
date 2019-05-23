mkdir -p external
cd external
npm install color-convert
npm install css-background-parser
cd ..
echo "downloading phantom.js"
wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
tar -xvjf phantomjs-2.1.1-linux-x86_64.tar.bz2
mv phantomjs-2.1.1-linux-x86_64 phantomjs
chmod +x phantomjs/bin/phantomjs
rm phantomjs-2.1.1-linux-x86_64.tar.bz2
