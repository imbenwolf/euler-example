const { ethers, BigNumber } = require("ethers");
const { markets, exec, eToken } = require("./utils");
const { expect } = require("chai");

const BUFFER = BigNumber.from(10).pow(18);

const mintSelfCollateralized = async (
  collateralTokenAddress,
  mintTokenAddress,
  collateralTokenAmount,
  leverage,
  signer
) => {
  const collateralAssetConfig = await markets.underlyingToAssetConfig(
    collateralTokenAddress
  );
  const borrowAssetConfig = await markets.underlyingToAssetConfig(
    mintTokenAddress
  );

  const [collateralPrice] = await exec.callStatic.getPrice(
    collateralTokenAddress
  );
  const [borrowPrice] = await exec.callStatic.getPrice(mintTokenAddress);

  const mintToken = new ethers.Contract(
    mintTokenAddress,
    ["function decimals() view returns (uint8)"],
    ethers.getDefaultProvider()
  );

  const singleMintToken = BigNumber.from(10).pow(await mintToken.decimals());

  expect(leverage).to.be.lte(19);

  const FORMATTED_LEVERAGE = BUFFER.div(
    BUFFER.sub(BUFFER.mul(leverage).div(leverage + 1))
  );

  const mintableAmount = singleMintToken
    .mul(collateralPrice)
    .mul(collateralAssetConfig.collateralFactor)
    .mul(borrowAssetConfig.borrowFactor)
    .mul(FORMATTED_LEVERAGE)
    .mul(collateralTokenAmount)
    .div(borrowPrice)
    .div(BUFFER.mul(16));

  console.log(ethers.utils.formatEther(mintableAmount));

  const eMintToken = eToken(
    await markets.underlyingToEToken(mintTokenAddress)
  ).connect(signer);

  await expect(
    eMintToken.mint(0, mintableAmount.add(singleMintToken.div(100)))
  ).to.be.revertedWith("e/collateral-violation");

  await eMintToken.mint(0, mintableAmount);

  return mintableAmount;
};

module.exports = mintSelfCollateralized;
