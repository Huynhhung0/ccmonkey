const manager = require("./manager.js");

// validate
// do the send
// update nonce
// record send

exports.handler = async function (event, context, callback) {
  console.log("******** NEW TRANSACTION ***********");
  console.log("request: " + JSON.stringify(event));
  // MARK: Variables

  const requestBody = JSON.parse(event.body);
  const destinationAddress = requestBody.destinationAddress;
  const recaptchaToken = requestBody.recaptchaToken;
  const ipAddress = event.requestContext.identity.sourceIp;
  const useTestnet = requestBody.useTestnet == "true";

  console.log("parsed values");
  console.log("destinationAddress: " + destinationAddress);
  console.log("recaptchaToken: " + recaptchaToken);
  console.log("ipAddress: " + ipAddress);
  console.log("useTestnet: " + useTestnet);

  const sendResult = await manager.validateAndExecuteSend(
    destinationAddress,
    recaptchaToken,
    ipAddress,
    useTestnet
  );
  if (sendResult.result != manager.ValidationCode.SUCCESS) {
    return errorResponse(sendResult.result, callback);
  }

  console.log("sending success response");

  callback(null, {
    statusCode: 201,
    body: JSON.stringify({
      ETHSendURL: sendResult.ethSendURL
    }),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
};

// Error Handling

function errorResponse(errorMessage, callback) {
  console.log("error format");
  console.log(errorMessage);

  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage
    }),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
}
