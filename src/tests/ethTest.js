const eth = require("../main/lambda/eth.js");

const destinationAddress = "0x9aDFa7b522152752Cd4eB92a84f2Eb8a97686495";
const useTestnet = false;

const main = async () => {
  const result = await eth.sendToAddress(destinationAddress, useTestnet);
  console.log(result);
  process.exit();
};

main();
