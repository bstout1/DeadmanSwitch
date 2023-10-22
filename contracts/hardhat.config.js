require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan")
require('dotenv').config()
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "mantleTestnet",
  networks: {
    mantleTestnet: {
      url: "https://rpc.testnet.mantle.xyz",
      chainId: 5001,
      accounts: [PRIVATE_KEY],
      gasLimit: "0x1000000"
    },
    mantleMainnet: {
      url: "https://rpc.mantle.xyz",
      chainId: 5000,
      accounts: [PRIVATE_KEY],
      gasLimit: "0x1000000"
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
            {
                network: "mantleTestnet",
                chainId: 5001,
                urls: {
                apiURL: "https://explorer.testnet.mantle.xyz/api",
                browserURL: "https://explorer.testnet.mantle.xyz"
                }
            },
            {
                network: "mantle",
                chainId: 5000,
                urls: {
                apiURL: "https://explorer.mantle.xyz/api",
                browserURL: "https://explorer.mantle.xyz/"
                }
            }
        ]
  }
};
