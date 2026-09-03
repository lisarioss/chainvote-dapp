export const CHAINVOTE_ADDRESS =
  "0x3644F9d0897b5356053feEb4E98A866a1A5A7b98";

export const CHAINVOTE_ABI = [
  "function getCandidates() view returns ((string name, uint256 voteCount)[])",
  "function getCandidatesCount() view returns (uint256)",
  "function getCandidate(uint256 candidateId) view returns (string name, uint256 voteCount)",
  "function hasVoted(address) view returns (bool)",
  "function vote(uint256 candidateId)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId)",
];