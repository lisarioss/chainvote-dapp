import { expect } from "chai";
import { network } from "hardhat";

describe("ChainVote", function () {
  async function deployChainVote() {
    const { ethers } = await network.connect();

    const [owner, voter1, voter2] = await ethers.getSigners();

    const candidates = ["Alice", "Bob", "Charlie"];

    const ChainVote = await ethers.getContractFactory("ChainVote");
    const chainVote = await ChainVote.deploy(candidates);

    await chainVote.waitForDeployment();

    return {
      chainVote,
      owner,
      voter1,
      voter2,
      candidates,
    };
  }

  it("Should create the candidates correctly", async function () {
    const { chainVote } = await deployChainVote();

    expect(await chainVote.getCandidatesCount()).to.equal(3n);

    const candidate = await chainVote.getCandidate(0);

    expect(candidate[0]).to.equal("Alice");
    expect(candidate[1]).to.equal(0n);
  });

  it("Should allow a wallet to vote", async function () {
    const { chainVote, voter1 } = await deployChainVote();

    await chainVote.connect(voter1).vote(0);

    const candidate = await chainVote.getCandidate(0);

    expect(candidate[1]).to.equal(1n);
    expect(await chainVote.hasVoted(voter1.address)).to.equal(true);
  });

  it("Should prevent the same wallet from voting twice", async function () {
    const { chainVote, voter1 } = await deployChainVote();

    await chainVote.connect(voter1).vote(0);

    await expect(
      chainVote.connect(voter1).vote(1)
    ).to.be.revertedWith("Address has already voted");
  });

  it("Should allow different wallets to vote", async function () {
    const { chainVote, voter1, voter2 } = await deployChainVote();

    await chainVote.connect(voter1).vote(0);
    await chainVote.connect(voter2).vote(0);

    const candidate = await chainVote.getCandidate(0);

    expect(candidate[1]).to.equal(2n);
  });

  it("Should reject an invalid candidate", async function () {
    const { chainVote, voter1 } = await deployChainVote();

    await expect(
      chainVote.connect(voter1).vote(99)
    ).to.be.revertedWith("Invalid candidate");
  });

  it("Should emit VoteCast when a vote is registered", async function () {
    const { chainVote, voter1 } = await deployChainVote();

    await expect(chainVote.connect(voter1).vote(1))
      .to.emit(chainVote, "VoteCast")
      .withArgs(voter1.address, 1n);
  });
});