import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.clear();
console.log("%cHey Bem vindo Implantação - SUL", "color: #4CAF50; font-size: 24px; font-weight: bold;");
console.log("%cBy LorD", "color: #2196F3; font-size: 16px; font-style: italic;");

createRoot(document.getElementById("root")!).render(<App />);
