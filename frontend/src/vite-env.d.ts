/// <reference types="vite/client" />

interface EthereumProvider {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;

  on?: (
    event: string,
    listener: (...args: any[]) => void
  ) => void;

  removeListener?: (
    event: string,
    listener: (...args: any[]) => void
  ) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}