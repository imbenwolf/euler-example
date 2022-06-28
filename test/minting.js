const { expect } = require("chai");
const { ethers } = require("hardhat");
const ETOKEN = require("./interfaces/EToken.json");

const eDAI_ADDRESS = "0xe025E3ca2bE02316033184551D4d3Aa22024D9DC";
const eWSTETH_ADDRESS = "0xbd1bd5C956684f7EB79DA40f582cbE1373A1D593";

const eToken = (address) => new ethers.Contract(address, ETOKEN.abi);

describe("Euler minting", function () {
  let account1, account2;

  before(async function () {
    [account1, account2] = await hre.ethers.getSigners();
  });

  describe("ewstETH", function () {
    let ewstETH;

    before(function () {
      ewstETH = eToken(eWSTETH_ADDRESS).connect(account1);
    });

    it("does not mint 19 wstETH without collateral", async function () {
      await expect(ewstETH.mint(0, 19)).to.be.revertedWith(
        "e/collateral-violation"
      );
    });

    it("mints 18 wstETH without collateral", async function () {
      await expect(ewstETH.mint(0, 18)).to.not.be.reverted; // WTF?
    });
  });

  describe("eDAI", function () {
    let eDAI;

    before(function () {
      eDAI = eToken(eDAI_ADDRESS).connect(account2);
    });

    it("does not mint 200k dai without collateral", async function () {
      await expect(eDAI.mint(0, 200_000)).to.be.revertedWith(
        "e/collateral-violation"
      );
    });

    it("mints 20k dai without collateral", async function () {
      await expect(eDAI.mint(0, 20_000)).to.not.be.reverted; // WTF?
    });
  });
});
