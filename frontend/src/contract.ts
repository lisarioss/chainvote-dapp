export const CHAINVOTE_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const CHAINVOTE_ABI = [
  "function getCandidates() view returns ((string name, uint256 voteCount)[])",
  "function getCandidatesCount() view returns (uint256)",
  "function getCandidate(uint256 candidateId) view returns (string name, uint256 voteCount)",
  "function hasVoted(address) view returns (bool)",
  "function vote(uint256 candidateId)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId)",
];