import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import App from "./App.tsx";
import "./index.css";

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault();
  toast.error('Something went wrong. Please try again or DM @degentoolshq for help', {
    action: { label: 'Get help', onClick: () => window.open('https://twitter.com/degentoolshq', '_blank') },
  });
});

createRoot(document.getElementById("root")!).render(<App />);
