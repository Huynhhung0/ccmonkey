export AWS_PROFILE=ccmonkey

cd src/main/

echo "Deploying web"

aws s3 cp --recursive ./web/ s3://usdcfaucet.com

if [ $? -eq 0 ]; then
 echo "Upload successful"
else
 echo "Upload failed"
 exit 1;
fi
