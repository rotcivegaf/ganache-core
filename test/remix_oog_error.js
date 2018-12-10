const Web3 = require("web3");
// const assert = require("assert");
const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../index.js");
const fs = require("fs");
const path = require("path");
const solc = require("solc");

// Thanks solc. At least this works!
// This removes solc's overzealous uncaughtException event handler.
process.removeAllListeners("uncaughtException");

const mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

describe("Remix OOG Error", function() {
  let estimateGasContractData;
  let estimateGasContractAbi;
  let EstimateGasContract;
  let estimateGasInstance;

  const provider = Ganache.provider({ mnemonic });
  const web3 = new Web3(provider);
  let accounts = [];

  before("get accounts", async function() {
    accounts = await web3.eth.getAccounts();
  });

  before("compile source", async function() {
    this.timeout(10000);
    const source = fs.readFileSync(path.join(__dirname, "RemixOOGError.sol"), "utf8");
    const result = solc.compile({ sources: { "RemixOOGError.sol": source } }, 1);

    estimateGasContractData = "0x" + result.contracts["RemixOOGError.sol:Send"].bytecode;
    estimateGasContractAbi = JSON.parse(result.contracts["RemixOOGError.sol:Send"].interface);

    EstimateGasContract = new web3.eth.Contract(estimateGasContractAbi);
    let promiEvent = EstimateGasContract.deploy({ data: estimateGasContractData }).send({
      from: accounts[0],
      gas: 3141592
    });

    estimateGasInstance = await promiEvent;
  });

  after("cleanup", function() {
    web3.setProvider(null);
    provider.close(() => {});
  });

  describe("Gas Estimates", function() {
    it.only("estimates stufffff and processes thingsss", async() => {
      const from = accounts[0];
      const method = await estimateGasInstance.methods.something().send({ from, gas: 200000 });
      console.log(method);

      let result = await web3.eth.getBlock("latest", false);
      console.log(result);
      //   console.log(estimateGasInstance.methods.transfer);

      //   let stuff = await estimateGasInstance.methods.transfer(
      //     [accounts[1], accounts[2], accounts[3]],
      //     1000
      //   )
      //     .estimateGas({ from, gas: 200000 });
    });
  });
});
