const dynamo = require("./dynamo.js");
const eth = require("./eth.js");
const recaptcha = require("./recaptcha.js");
const values = require("./values.js");

const ValidationCode = {
  SUCCESS: "Success",
  GENERIC_ERROR: "Error",
  RECAPTCHA_FAIL: "Invalid Recaptcha",
  ADDRESS_PARSE_ERROR: "Invalid Destination Address",
  IP_REUSE: "IP has received maximum amount of coins",
  LAST_TX_PENDING: "Last Transaction Still Pending, Try Again Soon",
  SEND_ERROR: "Error Sending ETH"
};

module.exports.ValidationCode = ValidationCode;

async function validateTransaction(
  destinationAddress,
  recaptchaToken,
  ipAddress,
  useTestnet
) {
  const recaptchaVerifyResult = await recaptcha.siteVerify(
    recaptchaToken,
    ipAddress
  );
  const recaptchaSuccess = recaptchaVerifyResult.data.success;
  console.log("captcha" + recaptchaSuccess)
  if (recaptchaSuccess != true && !values.skipRecaptcha) {
    return ValidationCode.RECAPTCHA_FAIL;
  }

  const destinationIsAddress = await eth.isAddress(destinationAddress);
  if (destinationIsAddress != true) {
    return ValidationCode.ADDRESS_PARSE_ERROR;
  }

  const ipInformation = await dynamo.getRequestsFromUser(ipAddress);
  if (!(await dynamo.isUserEligibleToReceive(ipInformation, ipAddress, useTestnet))) {
    return ValidationCode.IP_REUSE;
  }

  const lastNonceResponse = await dynamo.getLastUsedNonce(useTestnet);
  var lastNonceValue = 0;
  console.log(lastNonceResponse);
  if (lastNonceResponse.Item.Nonce) {
    lastNonceValue = Number(lastNonceResponse.Item.Nonce);
  }

  const ethNonceValue = await eth.getNonceValue(useTestnet);
  if (lastNonceValue != ethNonceValue) {
    console.log("lastNonce:" + lastNonceValue);
    console.log("currentNonce:" + ethNonceValue);
    return ValidationCode.LAST_TX_PENDING;
  }

  return ValidationCode.SUCCESS;
}

module.exports.validateAndExecuteSend = async function (
  destinationAddress,
  recaptchaToken,
  ipAddress,
  useTestnet
) {
  console.log("validating transaction");
  const validationResult = await validateTransaction(
    destinationAddress,
    recaptchaToken,
    ipAddress,
    useTestnet
  );

  if (validationResult != ValidationCode.SUCCESS && !values.skipNonce) {
    console.log("validation failed: " + validationResult);
    return { result: validationResult };
  }

  console.log("sending");
  const ethSendResult = await eth.sendToAddress(destinationAddress, useTestnet);
  if (!ethSendResult.sendURL) {
    console.log("send failed: " + validationResult);
    return { result: ValidationCode.SEND_ERROR };
  }

  console.log("getting block info");
  const ethSendURL = ethSendResult.sendURL;
  const txHash = ethSendResult.txHash;
  const ethNonceValue = await eth.getNonceValue(useTestnet);
  console.log("latest block nonce: " + ethNonceValue);
  await dynamo.updateNonce(ethNonceValue, useTestnet);

  console.log("recording send");
  await dynamo.recordSend(
    destinationAddress,
    ipAddress,
    txHash,
    ethSendURL,
    useTestnet
  );

  return {
    result: ValidationCode.SUCCESS,
    ethSendURL: ethSendURL
  };
};
