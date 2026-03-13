import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Clerk Key loaded:", clerkPubKey ? "✓ Yes" : "✗ Missing");
console.log("Mounting React app...");

if (!clerkPubKey) {
  console.error("❌ VITE_CLERK_PUBLISHABLE_KEY is missing!");
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial; background: #f5f5f5;">
      <div style="text-align: center; background: white; padding: 40px; border-radius: 8px;">
        <h1 style="color: #e53e3e;">⚠️ Configuration Error</h1>
        <p style="color: #666;">VITE_CLERK_PUBLISHABLE_KEY is not defined</p>
        <p style="color: #999; font-size: 12px;">Check your .env file</p>
      </div>
    </div>
  `;
  throw new Error("Missing Clerk public key");
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
