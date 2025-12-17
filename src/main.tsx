
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import SmoothScrollProvider from "./providers/SmoothScroll";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <SmoothScrollProvider>
      <App />
    </SmoothScrollProvider>,
  );
  
