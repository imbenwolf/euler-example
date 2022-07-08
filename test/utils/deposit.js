const { BigNumber, ethers } = require("ethers");
const { markets, depositToken, eToken } = require("./utils");
const { expect } = require("chai");

const EULER_PROXY = "0x27182842E098f60e3D576794A5bFFb0777E025d3";

const deposit = async (tokenAddress, tokenAmount, signer) => {
  const token = new ethers.Contract(
    tokenAddress,
    [
      "function decimals() view returns (uint8)",
      "function approve(address to, uint amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)",
    ],
    signer
  );

  const tokenAmountWithDecimals = BigNumber.from(10)
    .pow(await token.decimals())
    .mul(tokenAmount);

  expect(await token.balanceOf(await signer.getAddress())).to.be.gte(
    tokenAmountWithDecimals
  );

  await markets.connect(signer).enterMarket(0, tokenAddress);
  await token.approve(EULER_PROXY, tokenAmountWithDecimals);

  const depositToken = eToken(
    await markets.underlyingToEToken(tokenAddress)
  ).connect(signer);

  const balanceBefore = await depositToken.balanceOfUnderlying(
    await signer.getAddress()
  );
  await depositToken.deposit(0, tokenAmountWithDecimals);

  expect(
    await depositToken.balanceOfUnderlying(await signer.getAddress())
  ).to.be.closeTo(
    balanceBefore.add(tokenAmountWithDecimals),
    1 // due to rounding
  );
};

module.exports = deposit;
