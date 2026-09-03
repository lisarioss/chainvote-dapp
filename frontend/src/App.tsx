import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CHAINVOTE_ABI, CHAINVOTE_ADDRESS } from "./contract";
import "./App.css";

type Candidate = {
  id: number;
  name: string;
  votes: number;
};

const SEPOLIA_CHAIN_ID = "0xaa36a7";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const [votingCandidate, setVotingCandidate] = useState<number | null>(
    null
  );

  const [transactionHash, setTransactionHash] = useState<string | null>(
    null
  );

  // Carrega os candidatos diretamente do contrato na Sepolia
  const loadCandidates = useCallback(
    async (provider?: BrowserProvider) => {
      try {
        setLoading(true);
        setError("");

        if (!window.ethereum) {
          setError("MetaMask not found.");
          return;
        }

        const blockchainProvider =
          provider ?? new BrowserProvider(window.ethereum);

        const network = await blockchainProvider.getNetwork();

        if (network.chainId !== 11155111n) {
          setCandidates([]);
          setError("Switch MetaMask to the Sepolia network.");
          return;
        }

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
        setCandidates([]);
        setError(
          "Unable to load candidates from Sepolia. Check the network and contract address."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Verifica se a carteira conectada já votou
  async function checkVotingStatus(
    currentAccount: string,
    provider: BrowserProvider
  ) {
    try {
      const contract = new Contract(
        CHAINVOTE_ADDRESS,
        CHAINVOTE_ABI,
        provider
      );

      const alreadyVoted = await contract.hasVoted(currentAccount);

      setHasVoted(alreadyVoted);
    } catch (err) {
      console.error(err);
      setHasVoted(false);
    }
  }

  // Conecta a MetaMask e muda automaticamente para Sepolia
  async function connectWallet() {
    try {
      setError("");
      setSuccess("");

      if (!window.ethereum) {
        setError("MetaMask not found.");
        return;
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });

      const provider = new BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      const currentAccount = accounts[0];

      if (!currentAccount) {
        setError("No MetaMask account was selected.");
        return;
      }

      setAccount(currentAccount);

      await checkVotingStatus(currentAccount, provider);
      await loadCandidates(provider);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect wallet. Make sure MetaMask is using the Sepolia network."
      );
    }
  }

  // Registra o voto no contrato da Sepolia
  async function vote(candidateId: number) {
    try {
      setError("");
      setSuccess("");
      setTransactionHash(null);
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

      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        setError("Switch MetaMask to Sepolia before voting.");
        return;
      }

      const signer = await provider.getSigner();

      const contract = new Contract(
        CHAINVOTE_ADDRESS,
        CHAINVOTE_ABI,
        signer
      );

      const transaction = await contract.vote(candidateId);

        setTransactionHash(transaction.hash);

        setSuccess(
          "Transaction sent to Sepolia. Waiting for blockchain confirmation..."
      );

      await transaction.wait();

      setHasVoted(true);

      setSuccess(
        "Vote successfully registered on the Sepolia blockchain."
      );

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

  // Detecta automaticamente conta já autorizada
  useEffect(() => {
    async function initialize() {
      if (!window.ethereum) {
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);

        const network = await provider.getNetwork();

        if (network.chainId !== 11155111n) {
          setCandidates([]);
          return;
        }

        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkVotingStatus(accounts[0], provider);
        }

        await loadCandidates(provider);
      } catch (err) {
        console.error(err);
      }
    }

    initialize();
  }, [loadCandidates]);

  // Detecta quando o usuário troca de conta ou rede na MetaMask
  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    function handleAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        setAccount(null);
        setHasVoted(false);
      } else {
        setAccount(accounts[0]);
        setHasVoted(false);
      }

      setSuccess("");
      setError("");
    }

    function handleChainChanged() {
      window.location.reload();
    }

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );

      window.ethereum?.removeListener?.(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>ChainVote</h1>
          <p>Decentralized Voting DApp</p>
        </div>

        <button className="wallet-button" onClick={connectWallet}>
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {success && (
    <div className="success-message">
      <span>{success}</span>

        {transactionHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View transaction on Etherscan
        </a>
      )}
    </div>
)}

      <main className="container">
        <section className="hero">
          <span className="network">
            Ethereum · Sepolia Testnet
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
              <span className="eyebrow">Candidates</span>
              <h3>Select one option</h3>
            </div>

            <span className="rule">
              One wallet = one vote
            </span>
          </div>

          {loading ? (
            <p>Loading candidates from Sepolia...</p>
          ) : (
            <div className="candidate-grid">
              {candidates.map((candidate) => (
                <article
                  className="candidate-card"
                  key={candidate.id}
                >
                  <div className="candidate-number">
                    {String(candidate.id + 1).padStart(2, "0")}
                  </div>

                  <h4>{candidate.name}</h4>

                  <div className="votes">
                    <strong>{candidate.votes}</strong>

                    <span>
                      {candidate.votes === 1 ? "vote" : "votes"}
                    </span>
                  </div>

                  <button
                    onClick={() => vote(candidate.id)}
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
                        : votingCandidate === candidate.id
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
        <span>Powered by Ethereum · Sepolia</span>
      </footer>
    </div>
  );
}

export default App;