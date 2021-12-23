import { ethers } from "ethers";
import sdk from './1-initialize-sdk.js';
import { readFileSync } from "fs";

const app = sdk.getAppModule("0x9e2f0C3A5015DE9ed1Ffb1b4A5925224278d7cE0");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "BaconDAO Membership",
      description: "A DAO for fans of Bacon.",
      image: readFileSync("scripts/assets/bacon.png"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅ Successfully deployed bundleDrop module, address:", bundleDropModule.address,
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata(),
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})()
