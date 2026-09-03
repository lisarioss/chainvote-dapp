import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChainVoteModule = buildModule("ChainVoteModule", (m) => {
  const candidates = ["Alice", "Bob", "Charlie"];

  const chainVote = m.contract("ChainVote", [candidates]);

  return { chainVote };
});

export default ChainVoteModule;