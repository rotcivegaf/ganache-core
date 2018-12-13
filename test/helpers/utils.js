const { promisify } = require("util");
module.exports = {
  // sleep: async(milliseconds) => {
  //   return new Promise((resolve) => {
  //     setTimeout(resolve, milliseconds);
  //   });
  // },
  sleep: async(milliseconds) => promisify(setTimeout)(milliseconds),
  send: (provider) => (method = "", ...params) => {
    return promisify(provider.send.bind(provider))({
      id: `${new Date().getTime()}`,
      jsonrpc: "2.0",
      method,
      params: [...params]
    });
  },
  pify: promisify
};
