const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../../index.js");
const Web3 = require("web3");

const preloadWeb3 = async(options = {}) => {
  const provider = Ganache.provider(options);
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  return {
    accounts,
    provider,
    web3
  };
};

module.exports = {
  preloadWeb3
};
