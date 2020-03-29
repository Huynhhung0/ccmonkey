const index = require("../main/lambda/index.js");

const destinationAddress = "0x9aDFa7b522152752Cd4eB92a84f2Eb8a97686495";
const recaptchaToken = "abc";
const ipAddress = "12.3.45";

// USAGE: node ../../helpers/ValidateAndSend.js true

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length != 1) {
    console.log(args);
    console.log("missing TESTNET arg");
    process.exit();
  }

  const useTestnet = args[0] == "true";

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
