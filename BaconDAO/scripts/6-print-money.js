import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

// address of ERC-20 contract
const tokenModule = sdk.getTokenModule(
  "0x97fE9540533e5fC0F971eA03fBa69942292b1053",
);

(async () => {
  try {
    const amount = 1_000_000;
    // We use the util function from "ethers" to convert the amount 
    // to have 18 decimals (which is the standard for ERC20 tokens).
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interact with your deployed ERC-20 contract and mint tokens!
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    console.log(
      "✅ There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$BACON in circulation",
    );
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();