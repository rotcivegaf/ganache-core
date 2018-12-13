const Web3 = require("web3");
const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../../index.js");
const { join } = require("path");
const { compileAndDeploy } = require("./compile_deploy");

const preloadContracts = (
  mainContractName = "",
  subContractNames = [],
  options = {},
  contractPath = "../contracts/"
) => {
  const context = {};

  before("Setting up web3 and contract", async function() {
    this.timeout(10000);

    const provider = Ganache.provider(options);
    const web3 = new Web3(provider);

    const { abi, accounts, bytecode, contract, instance, sources } = await compileAndDeploy(
      join(__dirname, contractPath),
      mainContractName,
      subContractNames,
      web3
    );

    Object.assign(context, {
      abi,
      accounts,
      bytecode,
      contract,
      instance,
      provider,
      sources,
      web3
    });
  });

  return context;
};

const preloadWeb3 = (options = {}) => {
  const context = {};

  before("Setting up web3", async function() {
    const provider = Ganache.provider(options);
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();

    Object.assign(context, {
      accounts,
      provider,
      web3
    });
  });

  return context;
};

module.exports = {
  preloadContracts,
  preloadWeb3
};
