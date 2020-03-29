const index = require("../main/lambda/index.js");

const destinationAddress = "0x9aDFa7b522152752Cd4eB92a84f2Eb8a97686495";
const recaptchaToken = "abc";
const ipAddress = "12.3.45";
const useTestnet = false;

const main = async () => {
  const result = await index.validateAndExecuteSend(
    destinationAddress,
    recaptchaToken,
    ipAddress,
    useTestnet
  );
  console.log(result);
  process.exit();
};

main();
