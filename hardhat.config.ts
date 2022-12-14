import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import accountUtils from "./utils/accounts";

import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.11",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  networks: {
    bsc_testnet: {
      url: "https://data-seed-prebsc-2-s3.binance.org:8545",
      accounts: accountUtils.getAccounts(),
    },
  },
};

export default config;
