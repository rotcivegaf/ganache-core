const assert = require("assert");
const fs = require("fs");
const solc = require("solc");
const { preloadContracts } = require("./helpers/pretest_setup");
const { send } = require("./helpers/rpc");

describe("Gas Estimates", function() {
  describe("modifying public strings within a contract", function() {
    // Main contract
    const mainContract = "ContractFactory"; // Name of the parent contract

    // List of all contracts to compile and deploy
    const subContractNames = ["ContractFactory"];

    const services = preloadContracts(mainContract, subContractNames);

    it("should create a contract from another contract", async() => {
      /**
       * Enable access to:
       * accounts - randomly generated test accounts
       * instance - contract instance
       * provider - Ganache (Geth and Parity coming soon)
       * web3 - web3 interface
       */
      const { accounts, instance, web3 } = services;

      const gas = 10 ** 7;
      const gasEstimate1 = await web3.eth.getBalance(accounts[0]);
      console.log(gasEstimate1);

      await instance.methods.createInstance().send({ from: accounts[0], gas });

      const gasEstimate2 = await web3.eth.getBalance(accounts[0]);
      console.log(gasEstimate2);
    }).timeout(5000);

    it("should estimate gas for contract created from another contract (eth_estimateGas)", async function() {
      const { accounts, web3 } = services;

      const contractAddress = "0xa3d1b6e8d21bd3e23cdbeb3aac3f494b97704411";
      const source = fs.readFileSync("./test/contracts/ContractFactory.sol", { encoding: "utf8" });
      // Note: Certain properties of the following contract data are hardcoded to
      // maintain repeatable tests. If you significantly change the solidity code,
      // make sure to update the resulting contract data with the correct values.
      const compilationResult = solc.compile(source, 1);
      const contract = {
        solidity: source,
        abi: compilationResult.contracts[":ContractFactory"].interface,
        binary: "0x" + compilationResult.contracts[":ContractFactory"].bytecode,
        runtimeBinary: "0x" + compilationResult.contracts[":ContractFactory"].runtimeBytecode,
        position_of_value: "0x0000000000000000000000000000000000000000000000000000000000000000",
        expected_default_value: 5,
        callData: {
          gasPrice: "0x01", // This is important, as passing it has exposed errors in the past.
          to: null, // set by test
          data: "0x3fa4f245"
        },
        transaction_data: {
          from: null, // set by test
          to: null, // set by test
          // sets data to 25 (base 10)
          data: "0xad5014670000000000000000000000000000000000000000000000000000000000000000",
          gas: 3141592
        }
      };

      // const encodedString = await web3.eth.abi.encodeFunctionSignature("createInstance()");

      const txData = contract.transaction_data;
      txData.to = contractAddress;
      txData.from = accounts[0];

      const startingBlockNumber = await web3.eth.getBlockNumber();

      const gasEstimate = await web3.eth.estimateGas(txData);

      const method = "eth_estimateGas";
      const params = [txData];
      const { result } = await send(method, params, web3);
      assert.strictEqual(gasEstimate, parseInt(result, 16));

      // assert.strictEqual(gasEstimate, 27693);

      const blockNumber = await web3.eth.getBlockNumber();

      assert.strictEqual(
        blockNumber,
        startingBlockNumber,
        "eth_estimateGas increased block count when it shouldn't have"
      );
    });
  });
});
