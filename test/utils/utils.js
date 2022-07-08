const { ethers, network } = require("hardhat");

const IETOKEN = require("../interfaces/EToken.json");
const TOKEN = require("../interfaces/ERC20.json");
const MARKETS = require("../interfaces/Markets.json");
const EXEC = require("../interfaces/Exec.json");

const eToken = (address) =>
  new ethers.Contract(address, IETOKEN.abi, ethers.getDefaultProvider());
const Token = (address) =>
  new ethers.Contract(address, TOKEN.abi, ethers.getDefaultProvider());
const markets = new ethers.Contract(
  "0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3",
  MARKETS.abi,
  ethers.getDefaultProvider()
);
const exec = new ethers.Contract(
  "0x59828FdF7ee634AaaD3f58B19fDBa3b03E2D9d80",
  EXEC.abi,
  ethers.getDefaultProvider()
);

const impersonateAccount = async (address) => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  const signer = await ethers.getSigner(address);

  return signer;
};

module.exports = {
  eToken,
  Token,
  markets,
  exec,
  impersonateAccount,
};
