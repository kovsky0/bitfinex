import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { OrderBook } from "./features/order-book/OrderBook";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <OrderBook />
      </header>
    </div>
  );
}

export default App;
