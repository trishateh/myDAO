import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { ThirdwebSDK } from "@3rdweb/sdk";

// Import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

// We instantiate the sdk on Rinkeby;
const sdk = new ThirdwebSDK("rinkeby");

// We grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x943142c0318fDBf482cE7AB2649CA1E0Ce7e1ab9",
);

const tokenModule = sdk.getTokenModule(
  "0x97fE9540533e5fC0F971eA03fBa69942292b1053"
);

const voteModule = sdk.getVoteModule(
  "0xdE64Cb13405F1e686B1d42Dbd3FE1E73DE8B463a",
);

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)

// The signer is required to sign transactions on the blockchain. 
// Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals)
      })
      .catch((err) => {
        console.error("Failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // Check if user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    // Check if user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log("🥵 User has already voted")
      })
      .catch((err) => {
        console.error("Failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // This useEffect grabs all addresses of members holding our NFT.
  useEffect(() => {
    if(!hasClaimedNFT) {
      return;
    }

    // Grab users who hold our NFT with tokenId 0.
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("🚀 Members addresses", addresses)
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.error("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // This useEffect grabs # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts)
        setMemberTokenAmounts(amounts);
      }) 
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

// Combine memberAddresses & memberTokenAmounts into a single array.
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If address isn't in memberTokenAmounts, it means they dont hold any of our token.
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // We pass our signer to the sdk, which enables us to interact with our deployed contract.
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have a connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if user has NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance > 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to NFT balance", error);
      });
  }, [address]);

  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>This Dapp only works on the Rinkeby network, please switch networks in your connected wallet.</p>
      </div>
    );
  }

  //This is the case where the user hasn't connected their wallet to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to BaconDAO 🥓</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button> 
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
      <h1>🥓 DAO Member Page</h1>
      <p>Congratulations on being a member</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
        <h2>Active Proposals</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Before we do async things, we want to disable the button to prevent double clicks.
            setIsVoting(true);

            // Get the votes from the form for the values.
            const votes = proposals.map((proposal) => {
              let voteResult = {
                proposalId: proposal.proposalId,
                //abstain by default
                vote: 2,
              };
              proposal.votes.forEach((vote) => {
                const elem = document.getElementById(
                  proposal.proposalId + "-" + vote.type
                );

                if (elem.checked) {
                  voteResult.vote = vote.type;
                  return;
                }
              });
              return voteResult;
            });

            // first we need to make sure the user delegates their token to vote.
            try {
              //check if wallet still needs to delegate their tokens before they can vote.
              const delegation = await tokenModule.getDelegationOf(address);
              // if the delegation is the 0x0 address that means they have not delegated their governance token yet.
              if (delegation === ethers.constants.AddressZero) {
                //if they haven't delegated their tokens yet, we'll have them delegate them before voting.
                await tokenModule.delegateTo(address);
              }
            // then we need to vote on the proposals
            try {
              await Promise.all(
                votes.map(async (vote) => {
                  //before voting we first need to check whether the proposal is open for voting
                  // we first need to get the latest state of the proposal
                  const proposal = await voteModule.get(vote.proposalId);
                  // then we check if the proposal is open for voting (state === 1 means it is open)
                  if (proposal.state === 1) {
                    // if it is open for voting, we'll vote on it
                    return voteModule.vote(vote.proposalId, vote.vote);
                  }
                  // if the proposal is not open for voting we just return nothing, letting us continue
                  return;
                })
              );
              try {
                // if any of the proposals are ready to be executed we'll need to execute them
                // a proposal is ready to be executed if it is in state 4
                await Promise.all(
                  votes.map(async (vote) => {
                    // first get the latest state of the proposal again, since we may have just voted before
                    const proposal = await voteModule.get(
                      vote.proposalId
                    );
                    //if the state is in state 4 (meaning ready to be executed), we'll execute the proposal.
                    if (proposal.state === 4) {
                      return voteModule.execute(vote.proposalId);
                    }
                  })
                );
                // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                setHasVoted(true);
                //and log out a success message
                console.log("successfully voted");
              } catch (err) {
                console.error("failed to execute votes", err);
              }
            } catch (err) {
              console.error("Failed to vote", err);
            }
            } catch (err) {
              console.error("Failed to delegate tokens");
            } finally {
              // in either case we need to set the isVoting state to false to enable the button again.
            }
          }}
        >
          {proposals.map((proposal, index) => (
            <div key={proposal.proposalId} className="card">
              <h5>{proposal.description}</h5>
              <div>
                {proposal.votes.map((vote) => (
                  <div key={vote.type}>
                  <input
                    type="radio"
                    id={proposal.proposalId + "-" + vote.type}
                    name={proposal.proposalId}
                    value={vote.type}
                    //default the "abstain" vote to checked
                    defaultChecked={vote.type === 2}
                  />
                  <label htmlFor={proposal.proposalId + "-" + vote.type}>
                    {vote.label}
                  </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button disabled={isVoting || hasVoted} type="submit">
            {isVoting
              ? "Voting..."
              : hasVoted
                ? "You Already Voted"
                : "Submit Votes"}
          </button>
          <small>
            This will trigger multiple transactions that you will need to sign.
          </small>
        </form>
        </div>
      </div>
      </div>
    );
  };
  
  const mintNft = () => {
    setIsClaiming(true);
    bundleDropModule
    .claim("0", 1)
    .catch((err) => {
      console.error("failed to claim", err);
      setIsClaiming(false);
    })
    .finally(() => {
      setIsClaiming(false);
      setHasClaimedNFT(true);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    });
  }

  return (
    <div className="mint-nft">
      <h1>Mint your free 🥓 DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => {
          setIsClaiming(true);
          // Call bundleDropModule.claim("0",1) to mint NFT to user's wallet.
          bundleDropModule
            .claim("0", 1)
            .catch ((err) => {
              console.error("failed to claim", err);
              setIsClaiming(false);
            })
            .finally(() => {
              setIsClaiming(false);
              setHasClaimedNFT(true);
              console.log(
                `Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
              );
            });
        }}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
