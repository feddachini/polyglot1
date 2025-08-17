import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeitnerLang - Multi-Language Learning",
  description: "Learn multiple languages simultaneously with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicContextProvider
          settings={{
            environmentId: "c237f1c5-d54f-43a0-aa17-ab017f738e3f",
            walletConnectors: [FlowWalletConnectors, EthereumWalletConnectors],
            overrides: {
              evmNetworks: [
                {
                  blockExplorerUrls: ['https://evm.flowscan.io/'],
                  chainId: 747,
                  chainName: 'Flow EVM Mainnet',
                  iconUrls: ["https://app.dynamic.xyz/assets/networks/flow.svg"],
                  name: 'Flow EVM',
                  nativeCurrency: {
                    decimals: 18,
                    name: 'FLOW',
                    symbol: 'FLOW',
                    iconUrl: 'https://app.dynamic.xyz/assets/networks/flow.svg',
                  },
                  networkId: 747,
                  rpcUrls: ['https://mainnet.evm.nodes.onflow.org'],
                  vanityName: 'Flow Mainnet',
                },
                {
                  blockExplorerUrls: ['https://evm-testnet.flowscan.io/'],
                  chainId: 545,
                  chainName: 'Flow EVM Testnet',
                  iconUrls: ["https://app.dynamic.xyz/assets/networks/flow.svg"],
                  name: 'Flow EVM Testnet',
                  nativeCurrency: {
                    decimals: 18,
                    name: 'FLOW',
                    symbol: 'FLOW',
                    iconUrl: 'https://app.dynamic.xyz/assets/networks/flow.svg',
                  },
                  networkId: 545,
                  rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
                  vanityName: 'Flow Testnet',
                }
              ]
            },
          }}
        >
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Navigation />
          </div>
        </DynamicContextProvider>
      </body>
    </html>
  );
}
