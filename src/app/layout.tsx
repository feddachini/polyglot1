import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { FlowWalletConnectors } from "@dynamic-labs/flow";

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
            walletConnectors: [FlowWalletConnectors],
          }}
        >
          {children}
        </DynamicContextProvider>
      </body>
    </html>
  );
}
