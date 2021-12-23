import { ethers } from "ethers";
import sdk from './1-initialize-sdk.js';

// This is our governance contract.
const voteModule = sdk.getVoteModule(
  "0xdE64Cb13405F1e686B1d42Dbd3FE1E73DE8B463a",
);

// This is our ERC-20 contract.
const tokenModule = sdk.getTokenModule(
  "0x97fE9540533e5fC0F971eA03fBa69942292b1053",
);

(async () => {
  try {
    // Give our treasury power to mint additional tokens if needed.
    await tokenModule.grantRole("minter", voteModule.address);

    console.log(
      "Successfully gave vote module permissions to act on token module"
    );
  } catch (error) {
    console.error(
      "Failed to grant vote module permissions on token module", 
      error
    );
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance.
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    //Grab 90% of the supply that we hold.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // Transfer 90% of the supply to our voting contract.
    await tokenModule.transfer(
      voteModule.address,
      percent90
    );

    console.log("✅ Successfully transferred tokens to vote module");
  } catch (err) {
    console.error("Failed to transfer tokens to vote module", err);
  }
})();