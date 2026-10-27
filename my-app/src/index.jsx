import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import { beforeSendPublic } from './publicAnalytics.mjs';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <App />
      <Analytics beforeSend={beforeSendPublic} />
    </Router>
  </React.StrictMode>,
);
