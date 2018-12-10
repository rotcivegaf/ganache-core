const BN = require("bn.js");
const Web3 = require("web3");
const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../index.js");
const assert = require("assert");

describe.only("Accounts", function() {
  const expectedAddress = "0x604a95C9165Bc95aE016a5299dd7d400dDDBEa9A";
  const mnemonic = "into trim cross then helmet popular suit hammer cart shrug oval student";

  it("should respect the BIP99 mnemonic", async() => {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        mnemonic: mnemonic
      })
    );

    const accounts = await web3.eth.getAccounts();
    assert(accounts[0].toLowerCase(), expectedAddress.toLowerCase());
  }).timeout(5000);

  it.only("should lock all accounts when specified", async function() {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        mnemonic: mnemonic,
        secure: true
      })
    );

    const accounts = await web3.eth.getAccounts();

    accounts.forEach(async(account) => {
      try {
        await web3.eth.sendTransaction({
          from: expectedAddress,
          to: "0x1234567890123456789012345678901234567890", // doesn't need to exist
          value: web3.utils.toWei(new BN(1), "ether"),
          gasLimit: 90000
        });
      } catch (error) {
        assert.strictEqual(error.message, "signer account is locked");
      }
    });

    /*
    web3.eth.sendTransaction(
      {
        from: expectedAddress,
        to: "0x1234567890123456789012345678901234567890", // doesn't need to exist
        value: web3.utils.toWei(new BN(1), "ether"),
        gasLimit: 90000
      },
      (err, tx) => {
        if (!err) {
          assert.fail("We expected the account to be locked, which should throw an error when sending a transaction");
        }
        assert(
          err.message.toLowerCase().indexOf("could not unlock signer account") >= 0,
          "Expected error message containing \"could not unlock signer account\" " +
            "(case insensitive check). Received the following error message, instead. " +
            `"${err.message}"`
        );
      }
    );
    */
  });

  it("should unlock specified accounts, in conjunction with --secure", () => {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        mnemonic: mnemonic,
        secure: true,
        unlocked_accounts: [expectedAddress]
      })
    );

    web3.eth.sendTransaction(
      {
        from: expectedAddress,
        to: "0x1234567890123456789012345678901234567890", // doesn't need to exist
        value: web3.utils.toWei(new BN(1), "ether"),
        gasLimit: 90000
      },
      function(err, tx) {
        if (err) {
          assert.fail(err.message);
        }
      }
    );
  }).timeout(5000);

  it("should unlock specified accounts, in conjunction with --secure, using array indexes", () => {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        mnemonic: mnemonic,
        secure: true,
        unlocked_accounts: [0]
      })
    );

    web3.eth.sendTransaction(
      {
        from: expectedAddress,
        to: "0x1234567890123456789012345678901234567890", // doesn't need to exist
        value: web3.utils.toWei(new BN(1), "ether"),
        gasLimit: 90000
      },
      function(err, tx) {
        if (err) {
          assert.fail(err.message);
        }
      }
    );
  });

  it("should unlock accounts even if private key isn't managed by the testrpc (impersonation)", async() => {
    const secondAddress = "0x1234567890123456789012345678901234567890";

    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        mnemonic: mnemonic,
        secure: true,
        unlocked_accounts: [0, secondAddress]
      })
    );

    // Set up: give second address some ether
    await web3.eth.sendTransaction({
      from: expectedAddress,
      to: secondAddress,
      value: web3.utils.toWei(new BN(10), "ether"),
      gasLimit: 90000
    });

    // Now we should be able to send a transaction from second address without issue.
    await web3.eth.sendTransaction({
      from: secondAddress,
      to: expectedAddress,
      value: web3.utils.toWei(new BN(5), "ether"),
      gasLimit: 90000
    });

    // And for the heck of it let's check the balance just to make sure it went through
    const balance = await web3.eth.getBalance(secondAddress);
    let balanceInEther = await web3.utils.fromWei(new BN(balance), "ether");

    if (typeof balanceInEther === "string") {
      balanceInEther = parseFloat(balanceInEther);
    } else {
      balanceInEther.toNumber();
    }

    // Can't check the balance exactly. It cost some ether to send the transaction.
    assert(balanceInEther > 4);
    assert(balanceInEther < 5);
  }).timeout(5000);

  it("errors when we try to sign a transaction from an account we're impersonating", async() => {
    const secondAddress = "0x1234567890123456789012345678901234567890";

    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        mnemonic: mnemonic,
        secure: true,
        unlocked_accounts: [0, secondAddress]
      })
    );

    try {
      await web3.eth.sign("some data", secondAddress);
      assert.fail("Expected an error while signing when not managing the private key");
    } catch (error) {
      assert(error.message.toLowerCase().indexOf("cannot sign data; no private key") >= 0);
    }
  });

  it("should create a 2 accounts when passing an object to provider", async() => {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        accounts: [{ balance: "0x12" }, { balance: "0x13" }]
      })
    );

    const accounts = await web3.eth.getAccounts();
    assert(accounts.length, 2, "The number of accounts created should be 2");
  }).timeout(5000);

  it("should create a 7 accounts when ", async() => {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        total_accounts: 7
      })
    );

    const accounts = await web3.eth.getAccounts();
    assert(accounts.length, 7, "The number of accounts created should be 7");
  }).timeout(5000);

  it("should respect the default_balance_ether option", async() => {
    const web3 = new Web3();
    web3.setProvider(
      Ganache.provider({
        default_balance_ether: 1.23456
      })
    );

    const accounts = await web3.eth.getAccounts();
    accounts.forEach(async(account) => {
      const balance = await web3.eth.getBalance(account);
      const balanceInEther = await web3.utils.fromWei(balance, "Ether");
      assert.strictEqual(balanceInEther, "1.23456");
    });
  });
});
