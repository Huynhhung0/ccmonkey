const dynamo = require("../main/lambda/dynamo.js");

// USAGE: node ../../helpers/UpdateNonce.js true 2100

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length != 2) {
    console.log("missing TESTNET or NONCE args");
    console.log(args);
    process.exit();
  }

  const useTestnet = args[0] == "true";
  const nonce = Number(args[1]);

  const request = await dynamo.updateNonce(nonce, useTestnet);
  console.log(request);

  const result = await dynamo.getLastUsedNonce(useTestnet);
  console.log(result);

  process.exit();
};

main();
