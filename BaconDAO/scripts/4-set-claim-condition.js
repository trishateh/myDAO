import sdk from './1-initialize-sdk.js';

const bundleDrop = sdk.getBundleDropModule(
  "0x943142c0318fDBf482cE7AB2649CA1E0Ce7e1ab9",
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
      // Specify conditions.
      claimConditionFactory.newClaimPhase({
        startTime: new Date(),
        maxQuantity: 50_000,
        maxQuantityPerTransaction: 1,
      });

      await bundleDrop.setClaimCondition(0, claimConditionFactory);
      console.log("✅ Sucessfully set claim condition!");
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})()