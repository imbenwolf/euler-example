const { BigNumber } = require("ethers");
const { swap, Token, impersonateAccount } = require("./utils/utils");
const deposit = require("./utils/deposit");
const mintSelfCollateralized = require("./utils/mintSelfCollateralized");

const USDC_WHALE = "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503";
const USDC = Token("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
const WSTETH = Token("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0");
const WETH = Token("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

const TOKEN_IN_AMOUNT = 500;

describe("Euler minting + swap", function () {
  let account1, account2;

  before(async function () {
    [account1, account2] = await hre.ethers.getSigners();

    await USDC.connect(await impersonateAccount(USDC_WHALE)).transfer(
      account1.address,
      BigNumber.from(10)
        .pow(await USDC.decimals())
        .mul(TOKEN_IN_AMOUNT)
    );

    await deposit(USDC.address, TOKEN_IN_AMOUNT, account1);
  });

  it("ewstETH", async function () {
    const amount = await mintSelfCollateralized(
      USDC.address,
      WSTETH.address,
      TOKEN_IN_AMOUNT,
      19,
      account1
    );

    await swap.connect(account1).swapUniExactInputSingle({
      subAccountIdIn: 0,
      subAccountIdOut: 0,
      underlyingIn: WSTETH.address,
      underlyingOut: WETH.address,
      amountIn: amount,
      amountOutMinimum: 0,
      deadline: 0,
      fee: 3000,
      sqrtPriceLimitX96: 0,
    });
  });
});
