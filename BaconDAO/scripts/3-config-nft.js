import sdk from './1-initialize-sdk.js';
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x943142c0318fDBf482cE7AB2649CA1E0Ce7e1ab9"
);
(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Bacon Headband",
        description: "This NFT will give you access to BaconDAO!",
        image: readFileSync("scripts/assets/headband.jpeg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()