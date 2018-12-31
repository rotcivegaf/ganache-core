// const { setUp } = require("./helpers/pretestSetup");
let Web3 = require("web3");
let assert = require("assert");
let Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../index.js");
let fs = require("fs");
let solc = require("solc");
// let async = require("async");
let to = require("../lib/utils/to.js");

// Thanks solc. At least this works!
// This removes solc's overzealous uncaughtException event handler.
process.removeAllListeners("uncaughtException");

let source = fs.readFileSync("./test/contracts/examples/Example.sol", { encoding: "utf8" });
let result = solc.compile(source, 1);

// Note: Certain properties of the following contract data are hardcoded to
// maintain repeatable tests. If you significantly change the solidity code,
// make sure to update the resulting contract data with the correct values.
let contract = {
  solidity: source,
  abi: result.contracts[":Example"].interface,
  binary: "0x" + result.contracts[":Example"].bytecode,
  position_of_value: "0x0000000000000000000000000000000000000000000000000000000000000000",
  expected_default_value: 5,
  call_data: {
    gas: "0x2fefd8",
    gasPrice: "0x1", // This is important, as passing it has exposed errors in the past.
    to: null, // set by test
    data: "0x3fa4f245"
  },
  transaction_data: {
    from: null, // set by test
    gas: "0x2fefd8",
    to: null, // set by test
    data: "0x552410770000000000000000000000000000000000000000000000000000000000000019" // sets value to 25 (base 10)
  }
};

describe("Block Tags", () => {
  let accounts;
  let web3 = new Web3(Ganache.provider());
  let contractAddress;

  let initialBlockNumber;
  let initial = {};

  before("Gather accounts", async() => {
    accounts = await web3.eth.getAccounts();
  });

  before("Get initial block number", async() => {
    const blockNumber = await web3.eth.getBlockNumber();
    initialBlockNumber = to.number(blockNumber);
  });

  before("Get initial balance and nonce", async() => {
    const balance = await web3.eth.getBalance(accounts[0]);
    const nonce = await web3.eth.getTransactionCount(accounts[0]);
    Object.assign(initial, {
      balance,
      nonce
    });
  });

  before("Make transaction that changes balance, nonce and code", async() => {
    const tx = await web3.eth.sendTransaction({
      from: accounts[0],
      data: contract.binary,
      gas: 3141592
    });
    contractAddress = tx.contractAddress;
  });

  it("should return the initial nonce at the previous block number", async() => {
    let nonce = await web3.eth.getTransactionCount(accounts[0], initialBlockNumber);
    assert.strictEqual(nonce, initial.nonce);

    // Check that the nonce incremented with the block number, just to be sure.
    nonce = await web3.eth.getTransactionCount(accounts[0], initialBlockNumber + 1);
    assert.strictEqual(nonce, initial.nonce + 1);
  });

  it("should return the initial balance at the previous block number", async() => {
    let balance = await web3.eth.getBalance(accounts[0], initialBlockNumber);
    assert.strictEqual(balance, initial.balance);

    // Check that the balance incremented with the block number, just to be sure.
    balance = await web3.eth.getBalance(accounts[0], initialBlockNumber + 1);
    let initialBalanceInEther = parseFloat(web3.utils.fromWei(initial.balance, "ether"));
    let balanceInEther = parseFloat(web3.utils.fromWei(balance, "ether"));
    assert(balanceInEther < initialBalanceInEther);
  });

  it("should return the no code at the previous block number", function(done) {
    web3.eth.getCode(contractAddress, initialBlockNumber, function(err, code) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(code, "0x");

      // Check that the code incremented with the block number, just to be sure.
      web3.eth.getCode(contractAddress, initialBlockNumber + 1, function(err, code) {
        if (err) {
          return done(err);
        }
        assert.notStrictEqual(code, "0x");
        assert(code.length > 20); // Just because we don't know the actual code we're supposed to get back
        done();
      });
    });
  });
});
