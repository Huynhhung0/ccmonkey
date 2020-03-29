const config = require("./config/config.json");
const secrets = require("./config/secrets.json");

module.exports.ethAddress = config.ethAddress;
module.exports.ethGasStation = config.ethGasStation;
module.exports.infuraProjectSecret = secrets.infuraProjectSecret;
module.exports.recaptchaSiteSecret = secrets.recaptchaSiteSecret;
module.exports.ethPrivateKey = secrets.ethPrivateKey;
module.exports.skipRecaptcha = process.env.SKIP_RECAPTCHA == "true";
module.exports.skipEligibility = process.env.SKIP_ELIGIBILITY == "true";
module.exports.skipNonce = process.env.SKIP_NONCE == "true";

module.exports.contractAddress = function (testnet) {
  return testnet ? config.testnet.contractAddress : config.main.contractAddress;
};

module.exports.currencyName = function (testnet) {
  return testnet ? config.testnet.currencyName : config.main.currencyName;
};

module.exports.infuraNetwork = function (testnet) {
  return (
    (testnet ? config.testnet.infuraNetwork : config.main.infuraNetwork) +
    config.infuraProjectID
  );
};

module.exports.etherscan = function (testnet) {
  return testnet ? config.testnet.etherscan : config.main.etherscan;
};

module.exports.chainId = function (testnet) {
  return testnet ? config.testnet.chainId : config.main.chainId;
};
