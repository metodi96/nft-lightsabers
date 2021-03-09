const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  contracts_build_directory: path.join(__dirname, "react-app/src/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 7545,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: "0.7.6"
    }
  }
};
