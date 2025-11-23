import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { ThirdwebProvider } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ThirdwebProvider>
        <QueryClientProvider client={client}>
            <App />
        </QueryClientProvider>
    </ThirdwebProvider>
);

