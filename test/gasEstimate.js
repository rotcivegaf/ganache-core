// const pify = require("pify");
const Web3 = require("web3");
const Ganache = require("../index");
// const assert = require("assert");
// const fs = require("fs");
// const solc = require("solc");
// const { preloadContracts } = require("./helpers/pretest_setup");
const { send } = require("./helpers/rpc");

describe.only("Gas Estimates", function() {
  describe("modifying public strings within a contract", function() {
    /*
    // Main contract
    const mainContract = "ContractFactory"; // Name of the parent contract

    // List of all contracts to compile and deploy
    const subContractNames = ["ContractFactory"];

    const services = preloadContracts(mainContract, subContractNames);
    */

    /*
    it("should create a contract from another contract", async() => {
      const { accounts, instance, web3 } = services;

      const gas = 10 ** 7;
      const gasEstimate1 = await web3.eth.getBalance(accounts[0]);
      console.log(gasEstimate1);

      await instance.methods.createInstance().send({ from: accounts[0], gas });

      const gasEstimate2 = await web3.eth.getBalance(accounts[0]);
      console.log(gasEstimate2);
    }).timeout(5000);
    */

    it.only("should estimate gas for contract created from another contract (eth_estimateGas)", async function() {
      // const { accounts, web3 } = services;
      const provider = Ganache.provider();
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();

      // const contractAddress = "0xa3d1b6e8d21bd3e23cdbeb3aac3f494b97704411";
      // const source = fs.readFileSync("./test/contracts/ContractFactory.sol", { encoding: "utf8" });
      // Note: Certain properties of the following contract data are hardcoded to
      // maintain repeatable tests. If you significantly change the solidity code,
      // make sure to update the resulting contract data with the correct values.
      // const compilationResult = solc.compile(source, 1);
      const contract = {
        /*
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
        */
        transaction_data: {
          from: null, // set by test
          // to: null, // set by test
          // sets data to 25 (base 10)
          // data: "0xad5014670000000000000000000000000000000000000000000000000000000000000000",
          data:
            // eslint-disable-next-line
            "0x608060405234801561001057600080fd5b50610116806100206000396000f300608060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063ad50146714610046575b600080fd5b34801561005257600080fd5b5061005b61005d565b005b6000610067610089565b604051809103906000f080158015610083573d6000803e3d6000fd5b50905050565b6040516052806100998339019056006080604052348015600f57600080fd5b50603580601d6000396000f3006080604052600080fd00a165627a7a72305820bfb4cf4f0195ccf04ba6008c65388178bcb969ad714f33e21eacd4212afb57d80029a165627a7a723058200cc13b8ec52a5d1687899662b9bc6cfbf28d32b8f918f391f249bd695189fe5e0029",
          value: "0x0",
          // data: "0xad50146714610046575b600080fd5b34801561005257600080fd5b5061005b61005d565b",
          gas: 125881
        }
      };

      const createInstance = {
        /*
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
        */
        transaction_data: {
          from: null, // set by test
          // to: null, // set by test
          // sets data to 25 (base 10)
          // data: "0xad5014670000000000000000000000000000000000000000000000000000000000000000",
          data: "0xad501467",
          value: "0x0",
          // data: "0xad50146714610046575b600080fd5b34801561005257600080fd5b5061005b61005d565b",
          // gas: 64202 - Math.ceil((64202 - 21000)/64)
          gas: 64202
        }
      };
      // const encodedString = await web3.eth.abi.encodeFunctionSignature("createInstance()");

      const txData = contract.transaction_data;
      txData.from = accounts[0];

      let method = "eth_sendTransaction";
      let params = [txData];
      let { result } = await send(method, params, web3);
      // let { result } = await send(web3)(method, params);
      const receipt = await web3.eth.getTransactionReceipt(result);

      const txData2 = createInstance.transaction_data;

      txData2.to = receipt.contractAddress;
      txData2.from = accounts[0];

      // let gasEstimate = await web3.eth.estimateGas(txData);
      // console.log(gasEstimate);
      let gasEstimate = await web3.eth.estimateGas(txData2);
      console.log("Gas Estimate: " + gasEstimate);

      method = "eth_sendTransaction";
      params = [txData2];
      ({ result } = await send(method, params, web3));
      // ({ result } = await send(web3)(method, params));
      // console.log(result);

      // assert.strictEqual(gasEstimate, parseInt(result, 16));

      /*
      method = "eth_estimateGas";
      const params = [txData];
      const { result } = await send(method, params, web3);
      assert.strictEqual(gasEstimate, parseInt(result, 16));

      const blockNumber = await web3.eth.getBlockNumber();

      assert.strictEqual(
        blockNumber,
        startingBlockNumber,
        "eth_estimateGas increased block count when it shouldn't have"
      );
      */
    });
  });
});

/*
const send = (provider) => (method = "", ...params) => {
  return pify(provider.send.bind(provider))({
    id: `${new Date().getTime()}`,
    jsonrpc: "2.0",
    method,
    params: [...params]
  });
}
*/
