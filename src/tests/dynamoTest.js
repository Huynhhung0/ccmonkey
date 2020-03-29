const dynamo = require("../main/lambda/dynamo.js");

const useTestnet = false;

const main = async () => {
  const result = await dynamo.getLastUsedNonce(useTestnet);
  console.log(result);

  const requests = await dynamo.getRequestsFromUser(
    "0x19CA1a1c40198946CE2C40B4F0c15ab1eD04d13F"
  );
  console.log(requests);
  process.exit();
};

main();
