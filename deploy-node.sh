export AWS_PROFILE=ccmonkey

docker pull node:12.16.1

node docker-npm.js rebuild

if [ ! -d "nodejs" ]
then
    mkdir "nodejs"
fi

echo "copying node_modules to nodejs"
cp -r node_modules nodejs
echo "finished copying"

echo "creating a new zip file"
zip -r nodejs.zip nodejs

echo "publishing layer"
aws lambda publish-layer-version \
--layer-name "FaucetPackages" \
--description "Dependencies For Sending ETH" \
--license-info "MIT" \
--zip-file "fileb://nodejs.zip" \
--compatible-runtimes nodejs12.x

rm nodejs.zip;
rm -rf nodejs;

version=$(aws lambda list-layer-versions --layer-name FaucetPackages | jq ".LayerVersions[0].Version")

echo $version

aws lambda update-function-configuration \
--function-name RequestUSDC \
--layers arn:aws:lambda:us-east-1:367082818365:layer:FaucetPackages:$version
