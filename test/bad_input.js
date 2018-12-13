/*
const Web3 = require("web3");
const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../index.js");
*/
const assert = require("assert");
const { preloadWeb3 } = require("./helpers/pretest_setup");
const { send } = require("./helpers/rpc");

describe("Provider:", () => {
  describe("bad input", () => {
    const services = preloadWeb3();

    it("recovers after 'to' address that isn't a string", async() => {
      const { accounts, web3 } = services;
      const iterations = 5;

      const method = "eth_sendTransaction";
      const params = [
        {
          value: "0x0",
          gas: "0xf4240",
          from: accounts[0],
          // Buffers have been sent in the past
          to: {
            type: "Buffer",
            data: [
              // ...
            ]
          },
          data: "0xe1fa8e84666f6f0000000000000000000000000000000000000000000000000000000000"
        }
      ];

      for (let i = 0; i < iterations; i++) {
        try {
          await send(method, params, web3);
        } catch (error) {
          assert.strictEqual(error.message, "Invalid to address");
        }
      }
    });

    it("recovers after bad nonce (too high)", async() => {
      const { accounts, web3 } = services;
      const method = "eth_sendTransaction";
      const params = [
        {
          value: "0x10000000",
          gas: "0xf4240",
          from: accounts[0],
          to: accounts[1],
          nonce: "0xffffffff" // too big nonce
        }
      ];

      try {
        await send(method, params, web3);
      } catch (error) {
        // We're supposed to get an error the first time. Let's assert we get the right one.
        // Note that if using the Ganache as a provider, err will be non-null when there's
        // an error. However, when using it as a server it won't be. In both cases, however,
        // result.error should be set with the same error message. We'll check for that.
        assert(
          error.message.indexOf(
            "the tx doesn't have the correct nonce. account has nonce of: 0 tx has nonce of: 4294967295"
          ) >= 0
        );
      }

      delete params[0].nonce;
      await send(method, params, web3);
    });

    it("recovers after bad nonce (too low)", async() => {
      const { accounts, web3 } = services;
      const method = "eth_sendTransaction";
      const params = [
        {
          value: "0x10000000",
          gas: "0xf4240",
          from: accounts[0],
          to: accounts[1],
          nonce: "0x0" // too low nonce
        }
      ];

      try {
        await send(method, params, web3);
      } catch (error) {
        assert(
          /the tx doesn't have the correct nonce. account has nonce of: 1 tx has nonce of: 0/.test(error.message),
          `Expected incorrect nonce error, got '${error.message}', instead.`
        );
      }

      delete params[0].nonce;
      await send(method, params, web3);
    });

    it("recovers after bad balance", async() => {
      const { accounts, web3 } = services;
      const method = "eth_sendTransaction";
      const params = [{ value: "0x1000000000000000000000000000", gas: "0xf4240", from: accounts[0], to: accounts[1] }];

      try {
        await send(method, params, web3);
      } catch (error) {
        const regExpr = /sender doesn't have enough funds to send tx. The upfront cost is: \d+ and the sender's account only has: \d+/;
        assert(regExpr.test(error.message), `Unexpected error message. Got ${error.message}.`);
      }

      params[0].value = "0x5";
      await send(method, params, web3);
    });
  });
});

/*
describe("Server:", () => {
  const services = preloadWeb3();
  let server;

  before("Initialize Ganache server", (done) => {
    const { web3 } = services;
    const port = 12345;

    server = Ganache.server({});
    server.listen(port, function() {
      web3.setProvider(new Web3.providers.HttpProvider(`http://localhost:"${port}`));
      done();
    });
  });

  after("Shutdown server", () => {
    server.close();
  });

  describe("bad input", () => {
    it("recovers after 'to' address that isn't a string", async() => {
      const { accounts, web3 } = services;
      const iterations = 5;

      const method = "eth_sendTransaction";
      const params = [
        {
          value: "0x0",
          gas: "0xf4240",
          from: accounts[0],
          // Buffers have been sent in the past
          to: {
            type: "Buffer",
            data: [
              // ...
            ]
          },
          data: "0xe1fa8e84666f6f0000000000000000000000000000000000000000000000000000000000"
        }
      ];

      for (let i = 0; i < iterations; i++) {
        try {
          await send(method, params, web3);
        } catch (error) {
          assert.strictEqual(error.message, "Invalid to address");
        }
      }
    });

    it("recovers after bad nonce (too high)", async() => {
      const { accounts, web3 } = services;
      const method = "eth_sendTransaction";
      const params = [
        {
          value: "0x10000000",
          gas: "0xf4240",
          from: accounts[0],
          to: accounts[1],
          nonce: "0xffffffff" // too big nonce
        }
      ];

      try {
        await send(method, params, web3);
      } catch (error) {
        // We're supposed to get an error the first time. Let's assert we get the right one.
        // Note that if using the Ganache as a provider, err will be non-null when there's
        // an error. However, when using it as a server it won't be. In both cases, however,
        // result.error should be set with the same error message. We'll check for that.
        assert(
          error.message.indexOf(
            "the tx doesn't have the correct nonce. account has nonce of: 0 tx has nonce of: 4294967295"
          ) >= 0
        );
      }

      delete params[0].nonce;
      await send(method, params, web3);
    });

    it("recovers after bad nonce (too low)", async() => {
      const { accounts, web3 } = services;
      const method = "eth_sendTransaction";
      const params = [
        {
          value: "0x10000000",
          gas: "0xf4240",
          from: accounts[0],
          to: accounts[1],
          nonce: "0x0" // too low nonce
        }
      ];

      try {
        await send(method, params, web3);
      } catch (error) {
        assert(
          /the tx doesn't have the correct nonce. account has nonce of: 1 tx has nonce of: 0/.test(error.message),
          `Expected incorrect nonce error, got '${error.message}', instead.`
        );
      }

      delete params[0].nonce;
      await send(method, params, web3);
    });

    it("recovers after bad balance", async() => {
      const { accounts, web3 } = services;
      const method = "eth_sendTransaction";
      const params = [{ value: "0x1000000000000000000000000000", gas: "0xf4240", from: accounts[0], to: accounts[1] }];

      try {
        await send(method, params, web3);
      } catch (error) {
        const regExpr = /sender doesn't have enough funds to send tx.
        The upfront cost is: \d+ and the sender's account only has: \d+/;
        assert(regExpr.test(error.message), `Unexpected error message. Got ${error.message}.`);
      }

      params[0].value = "0x5";
      await send(method, params, web3);
    });
  });
});
*/
