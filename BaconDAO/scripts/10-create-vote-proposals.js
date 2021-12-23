import { ethers } from "ethers";
import sdk from './1-initialize-sdk.js';

// Our voting contract.
const voteModule = sdk.getVoteModule(
  "0xdE64Cb13405F1e686B1d42Dbd3FE1E73DE8B463a",
);

// Our ERC-20 contract.
const tokenModule = sdk.getTokenModule(
  "0x97fE9540533e5fC0F971eA03fBa69942292b1053",
);

(async () => {
  try {
    const amount = 420_000;
    // Create proposal to mint 420,000 new tokens to the treasury.
    await voteModule.propose(
      "Should the DAO mint an additional " + amount + " tokens into the treasury?",
      [
        {
          // Our native token is ETH. nativeTokenValue is the amount of ETH we want to send in this proposal.
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // We're doing a mint! 
            // We are minting to voteModule, which is acting as our treasury.
            "mint",
            [
              voteModule.address,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          // Our token module that actually executes the mint.
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    // Create proposal to transfer ourselves 6,900 tokens.
    await voteModule.propose(
      "Should the DAO transfer " + amount + " tokens from the treasury to " + process.env.WALLET_ADDRESS + " for being awesome?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // We're doing a transfer from the treasury to our wallet.
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),

          toAddress: tokenModule.address,
        },
      ]
    );

    console.log( "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!");
  } catch (error) {
    console.error("Failed to create first proposal", error);
  }
})();