import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CHAINVOTE_ABI, CHAINVOTE_ADDRESS } from "./contract";
import "./App.css";

type Candidate = {
  id: number;
  name: string;
  votes: number;
};

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votingCandidate, setVotingCandidate] = useState<number | null>(
    null
  );

  // Conecta a MetaMask e garante que estamos na Hardhat Local
  async function connectWallet() {
    try {
      setError("");
      setSuccess("");

      if (!window.ethereum) {
        setError("MetaMask not found.");
        return;
      }

      // Hardhat Local = Chain ID 31337 = 0x7A69
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }],
      });

      const provider = new BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      const currentAccount = accounts[0];

      setAccount(currentAccount);

      // Consulta se essa carteira já votou
      const contract = new Contract(
        CHAINVOTE_ADDRESS,
        CHAINVOTE_ABI,
        provider
      );

      const alreadyVoted = await contract.hasVoted(currentAccount);

      setHasVoted(alreadyVoted);

      // Atualiza os candidatos
      await loadCandidates(provider);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect wallet. Make sure MetaMask is using Hardhat Local."
      );
    }
  }

  // Busca os candidatos diretamente do smart contract
  async function loadCandidates(provider?: BrowserProvider) {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("MetaMask not found.");
        return;
      }

      const blockchainProvider =
        provider ?? new BrowserProvider(window.ethereum);

      const contract = new Contract(
        CHAINVOTE_ADDRESS,
        CHAINVOTE_ABI,
        blockchainProvider
      );

      const data = await contract.getCandidates();

      const formattedCandidates: Candidate[] = data.map(
        (
          candidate: {
            name: string;
            voteCount: bigint;
          },
          index: number
        ) => ({
          id: index,
          name: candidate.name,
          votes: Number(candidate.voteCount),
        })
      );

      setCandidates(formattedCandidates);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load candidates. Check that Hardhat Local is running and the contract address is correct."
      );
    } finally {
      setLoading(false);
    }
  }

  // Registra o voto no smart contract
  async function vote(candidateId: number) {
    try {
      setError("");
      setSuccess("");
      setVotingCandidate(candidateId);

      if (!window.ethereum) {
        setError("MetaMask not found.");
        return;
      }

      if (!account) {
        setError("Connect your wallet before voting.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      // Para escrever na blockchain precisamos do signer
      const contract = new Contract(
        CHAINVOTE_ADDRESS,
        CHAINVOTE_ABI,
        signer
      );

      const transaction = await contract.vote(candidateId);

      setSuccess(
        "Transaction sent. Waiting for blockchain confirmation..."
      );

      // Aguarda a transação ser minerada
      await transaction.wait();

      setHasVoted(true);

      setSuccess(
        "Vote successfully registered on the blockchain."
      );

      // Busca novamente os resultados atualizados
      await loadCandidates(provider);
    } catch (err) {
      console.error(err);

      setSuccess("");

      setError(
        "The vote could not be registered. The transaction may have been rejected or this wallet may have already voted."
      );
    } finally {
      setVotingCandidate(null);
    }
  }

  // Tenta carregar os candidatos quando a página abre
  useEffect(() => {
    if (window.ethereum) {
      loadCandidates();
    }
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>ChainVote</h1>
          <p>Decentralized Voting DApp</p>
        </div>

        <button
          className="wallet-button"
          onClick={connectWallet}
        >
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <main className="container">
        <section className="hero">
          <span className="network">
            Ethereum · Hardhat Local
          </span>

          <h2>Cast your vote on-chain</h2>

          <p>
            Choose one candidate and register your vote directly
            on the blockchain. Each wallet can vote only once.
          </p>
        </section>

        <section className="status-card">
          <div>
            <span>Voting status</span>
            <strong>Open</strong>
          </div>

          <div>
            <span>Candidates</span>
            <strong>{candidates.length}</strong>
          </div>

          <div>
            <span>Wallet</span>
            <strong>
              {account ? "Connected" : "Not connected"}
            </strong>
          </div>
        </section>

        <section className="candidates-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                Candidates
              </span>

              <h3>Select one option</h3>
            </div>

            <span className="rule">
              One wallet = one vote
            </span>
          </div>

          {loading ? (
            <p>
              Loading candidates from blockchain...
            </p>
          ) : (
            <div className="candidate-grid">
              {candidates.map((candidate) => (
                <article
                  className="candidate-card"
                  key={candidate.id}
                >
                  <div className="candidate-number">
                    {String(candidate.id + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <h4>{candidate.name}</h4>

                  <div className="votes">
                    <strong>
                      {candidate.votes}
                    </strong>

                    <span>
                      {candidate.votes === 1
                        ? "vote"
                        : "votes"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      vote(candidate.id)
                    }
                    disabled={
                      !account ||
                      hasVoted ||
                      votingCandidate !== null
                    }
                  >
                    {!account
                      ? "Connect wallet to vote"
                      : hasVoted
                        ? "Already voted"
                        : votingCandidate ===
                            candidate.id
                          ? "Confirming..."
                          : "Vote"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>ChainVote</span>
        <span>Powered by Ethereum</span>
      </footer>
    </div>
  );
}

export default App;