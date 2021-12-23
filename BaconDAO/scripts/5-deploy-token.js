import sdk from './1-initialize-sdk.js';

const app = sdk.getAppModule("0x9e2f0C3A5015DE9ed1Ffb1b4A5925224278d7cE0");

(async () => {
  try {
    //Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      name: "BaconDAO Governance Token",
      symbol: "BACON",
    });
    console.log(
      "✅ Successfully deployed token module, address:", tokenModule.address,
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();