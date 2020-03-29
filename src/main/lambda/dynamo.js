const AWS = require("aws-sdk");
const values = require("./values.js");
var dynamodb = new AWS.DynamoDB({ region: "us-east-1" });
var ddb = new AWS.DynamoDB.DocumentClient({ service: dynamodb });

// Next Nonce

module.exports.getLastUsedNonce = async function (testnet) {
  const currencyName = values.currencyName(testnet);

  console.log("get last used nonce");
  console.log("currencyName: " + currencyName);

  const params = {
    TableName: "Currency",
    Key: {
      CurrencyName: currencyName
    }
  };

  return ddb.get(params).promise();
};

module.exports.updateNonce = async function (newNonce, testnet) {
  console.log("update nonce");
  const params = {
    TableName: "Currency",
    Item: {
      CurrencyName: values.currencyName(testnet),
      Nonce: Number(newNonce) + 1
    }
  };

  return ddb.put(params).promise();
};

// Sends

module.exports.getRequestsFromUser = async function (userId) {
  console.log("get requests from user");
  const params = {
    TableName: "Request",
    Key: {
      UserId: userId
    }
  };

  return ddb.get(params).promise();
};

module.exports.recordSend = async function (
  destinationAddress,
  ipAddress,
  txHash,
  ethSendURL,
  testnet
) {
  console.log("record send");
  const params = {
    TableName: "Send",
    Item: {
      SendId: generateUUID(),
      SendDate: Date(),
      DestinationAddress: destinationAddress,
      IPAddress: ipAddress,
      TxHash: txHash,
      ETHSendURL: ethSendURL,
      Testnet: testnet
    }
  };

  return ddb.put(params).promise();
};

// Helpers

module.exports.isUserEligibleToReceive = async function (
  requestInformation,
  userId,
  useTestnet
) {
  console.log("is user elgible to receive");
  console.log(useTestnet)
  console.log(values.skipEligibility)
  if (useTestnet && values.skipEligibility) {
    return true;
  }

  if (requestInformation["Item"]) {
    const amountOfRequests = Number(
      requestInformation["Item"]["NumberOfRequests"]
    );
    if (amountOfRequests > 19) {
      return false;
    }

    await updateRequestCount(userId, amountOfRequests + 1);
    return true;
  }

  await updateRequestCount(userId, 1);
  return true;
};

function generateUUID() {
  var d = new Date().getTime();
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    d += performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function updateRequestCount(userId, requestCount) {
  console.log("update request count");
  const params = {
    TableName: "Request",
    Item: {
      UserId: userId,
      NumberOfRequests: requestCount
    }
  };

  return ddb.put(params).promise();
}
