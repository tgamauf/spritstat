import "./index.sass";
import "intro.js/introjs.css";
import "intro.js/themes/introjs-modern.css"

import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";

import App from "./app/App";
import {store} from "./app/store";
import setupServiceWorker from "./common/service_worker/service-worker";


setupServiceWorker();
activatePushMessages();//TODO

console.debug("Start application");

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
