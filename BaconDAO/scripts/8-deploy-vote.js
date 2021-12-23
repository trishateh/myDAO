import sdk from './1-initialize-sdk.js';

const appModule = sdk.getAppModule(
  "0x9e2f0C3A5015DE9ed1Ffb1b4A5925224278d7cE0",
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Governance contract name.
      name: "BaconDAO's Epic Proposals",
      // our ERC-20 contract.
      votingTokenAddress: "0x97fE9540533e5fC0F971eA03fBa69942292b1053",
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 0,
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address,
    );
  } catch (err) {
    console.log("Failed to deploy vote module", err);
  }
})();