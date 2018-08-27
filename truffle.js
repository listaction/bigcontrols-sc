const Web3 = require('web3'),
      web3 = new Web3(),
      getAccount = () => {
        web3.setProvider(new Web3.providers.HttpProvider(`http://localhost:8545`));
        web3.eth.getAccounts((err, accounts) =>{
          if(err) 
            throw err;
          else {
            const account  = accounts[0];
            return account;
          }
        });
      }

module.exports = {
  networks: {
    contracts_build_directory: "./build",
    development: {
      host: "127.0.0.1",
      gas: 8000000,
      port: 9545,
      network_id: "*" // Match any network id
    },
    local: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      from: getAccount(),
      gas: 8000000,
      gasPrice: 100000000000
    },
  },
  solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	}
};
