const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../../index.js");
const Web3 = require("web3");

const getWeb3 = async(options = {}) => {
  const provider = Ganache.provider(options);
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  return {
    accounts,
    provider,
    web3
  };
};

const preloadWeb3 = (options = {}) => {
  before("Setting up web3", async() => {
    const provider = Ganache.provider(options);
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();

    Object.assign(context, {
      accounts,
      provider,
      web3
    });

    return context;
  }).timeout(10000);
};

module.exports = {
  getWeb3,
  preloadWeb3
};
