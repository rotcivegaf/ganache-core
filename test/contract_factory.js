const { preloadContracts } = require("./helpers/pretest_setup");

describe("Contract Strings", function() {
  describe("modifying public strings within a contract", function() {
    // Main contract
    const mainContract = "ContractFactory"; // Name of the parent contract

    // List of all contracts to compile and deploy
    const subContractNames = ["ContractFactory"];

    const services = preloadContracts(mainContract, subContractNames);

    it("should create a contract from another contract", async function() {
      /**
       * Enable access to:
       * accounts - randomly generated test accounts
       * instance - contract instance
       * provider - Ganache (Geth and Parity coming soon)
       * web3 - web3 interface
       */
      const { accounts, instance } = services;

      const gas = 10 ** 6;
      await instance.methods.createInstance().send({ from: accounts[0], gas });
    });
  });
});
