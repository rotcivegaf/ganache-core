const assert = require("assert");
const { setUp } = require("./helpers/pretestSetup");

// Thanks solc. At least this works!
// This removes solc's overzealous uncaughtException event handler.
process.removeAllListeners("uncaughtException");

const contract = {};

describe("Block Tags", () => {
  const mainContract = "Example";
  const contractFilenames = [];
  const contractPath = "../contracts/examples/";
  const options = {};

  const services = setUp(mainContract, contractFilenames, options, contractPath);

  const initialState = {};

  before("Customize contract data", async() => {
    const { abi, bytecode, sources } = services;

    // Note: Certain properties of the following contract data are hardcoded to
    // maintain repeatable tests. If you significantly change the solidity code,
    // make sure to update the resulting contract data with the correct values.
    Object.assign(contract, {
      solidity: sources["Example.sol"],
      abi,
      binary: bytecode,
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
    });
  });

  before("Get initial balance, nonce and block number", async() => {
    const { accounts, web3 } = services;

    const balance = await web3.eth.getBalance(accounts[0]);
    const nonce = await web3.eth.getTransactionCount(accounts[0]);
    const blockNumber = await web3.eth.getBlockNumber();

    Object.assign(initialState, {
      balance,
      blockNumber,
      nonce
    });
  });

  before("Make a transaction that changes the balance, code and nonce", async() => {
    const { accounts, web3 } = services;
    const { contractAddress } = await web3.eth.sendTransaction({
      from: accounts[0],
      data: contract.binary,
      gas: 3141592
    });

    Object.assign(initialState, { contractAddress });
  });

  it("should return the initial nonce at the previous block number", async() => {
    const { accounts, web3 } = services;
    const { blockNumber, nonce } = initialState;
    let testNonce = await web3.eth.getTransactionCount(accounts[0], blockNumber);
    assert.strictEqual(testNonce, nonce);

    // Check that the nonce incremented with the block number, just to be sure.
    testNonce = await web3.eth.getTransactionCount(accounts[0], blockNumber + 1);
    assert.strictEqual(testNonce, nonce + 1);
  });

  it("should return the initial balance at the previous block number", async() => {
    const { accounts, web3 } = services;
    const { balance, blockNumber } = initialState;
    let testBalance = await web3.eth.getBalance(accounts[0], blockNumber);
    assert.strictEqual(testBalance, balance);

    // Check that the balance incremented with the block number, just to be sure.
    testBalance = await web3.eth.getBalance(accounts[0], blockNumber + 1);
    let initialBalanceInEther = parseFloat(web3.utils.fromWei(balance, "ether"));
    let balanceInEther = parseFloat(web3.utils.fromWei(testBalance, "ether"));
    assert(balanceInEther < initialBalanceInEther);
  });

  it("should return the no code at the previous block number", async() => {
    const { web3 } = services;
    const { contractAddress, blockNumber } = initialState;

    let code = await web3.eth.getCode(contractAddress, blockNumber);
    assert.strictEqual(code, "0x");

    // Check that the code incremented with the block number, just to be sure.
    code = await web3.eth.getCode(contractAddress, blockNumber + 1);
    assert.notStrictEqual(code, "0x");
    assert(code.length > 20); // Just because we don't know the actual code we're supposed to get back
  });
});
