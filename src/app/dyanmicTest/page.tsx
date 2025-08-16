import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";

import { FlowWalletConnectors } from "@dynamic-labs/flow";


export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "c237f1c5-d54f-43a0-aa17-ab017f738e3f",
        walletConnectors: [FlowWalletConnectors],
      }}
    >
      <DynamicWidget />
    </DynamicContextProvider>
  );

