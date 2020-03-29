const Values = require("./values.js");
const Web3 = require("web3");
const EthereumTx = require("ethereumjs-tx");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const getCurrentGasPrices = async () => {
  let response = await axios.get(Values.ethGasStation);
  let prices = {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10
  };

  return prices;
};

async function sendSignedTx(transactionHash, useTestnet) {
  let response = await axios({
    method: "POST",
    url: Values.infuraNetwork(useTestnet),
    data: {
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: [transactionHash],
      id: 1
    }
  });

  return response;
}

function createWeb3(useTestnet) {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(Values.infuraNetwork(useTestnet))
  );
  web3.eth.defaultAccount = Values.ethAddress;
  return web3;
}

module.exports.isAddress = async function (destinationAddress) {
  const web3 = createWeb3(false);
  let isAddress = await web3.utils.isAddress(destinationAddress);
  return isAddress;
};

module.exports.getNonceValue = async function (useTestnet) {
  const web3 = createWeb3(useTestnet);
  let addressNonce = await web3.eth.getTransactionCount(
    web3.eth.defaultAccount
  );
  return addressNonce;
};

module.exports.sendToAddress = async function (destinationAddress, useTestnet) {
  const web3 = createWeb3(useTestnet);
  const addressNonce = await web3.eth.getTransactionCount(
    web3.eth.defaultAccount
  );

  console.log("The next nonce for your wallet address is:" + addressNonce);
  console.log("Destination Address " + destinationAddress);
  /**
   * Fetch the balance of the destination address
   */
  let destinationBalanceWei = await web3.eth.getBalance(destinationAddress);
  let destinationBalance = web3.utils.fromWei(destinationBalanceWei, "ether");
  console.log("Destination Address Balance" + destinationBalance);

  /**
   * Fetch your personal wallet's balance
   */
  let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount);
  let myBalance = web3.utils.fromWei(myBalanceWei, "ether");
  console.log("My Balance " + myBalance);

  /**
   * Fetch the current transaction gas prices from https://ethgasstation.info/
   */
  let gasPrices = await getCurrentGasPrices();

  var abiArray = JSON.parse(
    fs.readFileSync(path.resolve("config", "usdc.json"), "utf-8")
  );
  var contract = new web3.eth.Contract(
    abiArray,
    Values.contractAddress(useTestnet),
    {
      from: Values.ethAddress
    }
  );

  // How many tokens do I have before sending?
  var balance = await contract.methods.balanceOf(Values.ethAddress).call();
  console.log("Balance before send:" + balance);

  /**
   * Build a new transaction object and sign it locally.
   */
  let details = {
    to: Values.contractAddress(useTestnet),
    value: "0x0",
    gas: 230000,
    gasPrice: gasPrices.medium * 1000000000,
    nonce: addressNonce,
    data: contract.methods
      .transfer(destinationAddress, useTestnet ? 300 : 1)
      .encodeABI(),
    chainId: Values.chainId(useTestnet)
  };

  const transaction = new EthereumTx(details);
  console.log("tx made");
  console.log("transaction " + JSON.stringify(transaction));

  /**
   * This is where the transaction is authorized on your behalf.
   * The private key is what unlocks your wallet.
   */
  transaction.sign(Buffer.from(Values.ethPrivateKey, "hex"));
  console.log("tx signed");

  /**
   * Now, we'll compress the transaction info down into a transportable object.
   */
  const serializedTransaction = transaction.serialize();
  console.log("tx serialized");

  /**
   * We're ready! Submit the raw transaction details to the provider configured above.
   */
  const transactionResponse = await sendSignedTx(
    "0x" + serializedTransaction.toString("hex"),
    useTestnet
  );
  console.log("tx response");
  const txHash = transactionResponse.data["result"];
  console.log(transactionResponse)
  console.log("tx hash");
  console.log(txHash);
  const url = Values.etherscan(useTestnet) + txHash;
  console.log(url);

  /**
   * We now know the transaction ID, so let's build the public Etherscan url where
   * the transaction details can be viewed.
   */
  return {
    sendURL: url,
    txHash: txHash
  };
};
