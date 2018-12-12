const assert = require("assert");
const { preloadContracts } = require("../helpers/pretest_setup");

describe("Call", () => {
  const mainContract = "Call"; // Name of the parent contract

  // List of all contract files to compile and deploy
  const subContractFilenames = ["Call"];

  const providerOptions = {
    vmErrorsOnRPCResponse: false
  };

  describe("undefined", () => {
    /**
     * Enable access to:
     * abi - abi
     * accounts - randomly generated test accounts
     * bytecode - contract bytecode
     * contract - contract interface object
     * instance - contract instance on the blockchain
     * provider - Ganache (Geth and Parity coming soon)
     * sources - raw contract files
     * web3 - web3 interface
     */
    const services = preloadContracts(mainContract, subContractFilenames, providerOptions);

    it("should return `0x` when eth_call fails (web3.eth call)", async() => {
      const { instance, web3 } = services;

      const signature = instance.methods.causeReturnValueOfUndefined()._method.signature;

      // test raw JSON RPC value:
      const result = await web3.eth.call({
        to: instance._address,
        data: signature
      });
      assert.strictEqual(result, "0x");
    });

    it("should throw due to returned value of `0x` when eth_call fails (compiled contract call)", async() => {
      const { instance } = services;
      // running this test with callback style because I couldn't get `assert.throws`
      // to work with async/await (in node 10.0.0 this is handled by `assert.rejects`)
      try {
        await instance.methods.causeReturnValueOfUndefined().call();
      } catch (error) {
        assert.strictEqual(error.message, "Couldn't decode bool from ABI: 0x");
      }
    });

    it("should return a value when contract and method exists at block (web3.eth.call)", async() => {
      const { instance, web3 } = services;

      const signature = instance.methods.theAnswerToLifeTheUniverseAndEverything()._method.signature;
      const params = {
        to: instance._address,
        data: signature
      };
      // test raw JSON RPC value:
      const result = await web3.eth.call(params, "latest");
      assert.strictEqual(
        result,
        "0x000000000000000000000000000000000000000000000000000000000000002a",
        "it should return 42 (as hex)"
      );
    });

    it("should return a value when contract and method exists at block (compiled contract call)", async() => {
      const { instance } = services;
      const result = await instance.methods.theAnswerToLifeTheUniverseAndEverything().call();
      assert.strictEqual(result, "42");
    });

    it("should return 0x when contract doesn't exist at block", async() => {
      const { instance, web3 } = services;

      const signature = instance.methods.theAnswerToLifeTheUniverseAndEverything()._method.signature;
      const params = {
        to: instance._address,
        data: signature
      };
      const result = await web3.eth.call(params, "earliest");

      assert.strictEqual(result, "0x");
    });

    it("should return 0x when method doesn't exist at block", async() => {
      const { instance, web3 } = services;
      const params = {
        to: instance._address,
        data: "0x01234567"
      };
      const result = await web3.eth.call(params, "latest");

      assert.strictEqual(result, "0x");
    });
  });
});
