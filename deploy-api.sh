export AWS_PROFILE=ccmonkey

cd src/main/lambda

lambda=RequestUSDC
echo "Deploying $lambda";

echo "creating a new zip file"
zip archive.zip -r *

echo "Uploading $lambda";

aws lambda update-function-code --function-name $lambda --zip-file fileb://archive.zip --publish --region us-east-1

if [ $? -eq 0 ]; then
 echo "Upload successful"
else
 echo "Upload failed"
 echo "If the error was a 400, check that there are no slashes in your lambda name"
 echo "Lambda name = $lambda"
 exit 1;
fi

rm archive.zip;
