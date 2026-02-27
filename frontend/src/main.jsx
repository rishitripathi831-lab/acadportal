import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// --- Import CSS Files ---
// The order ensures that global styles are loaded first,
// and page-specific styles can override them if needed.
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);