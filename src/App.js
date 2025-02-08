import React, { useState } from "react";
import "./App.css";
import Login from "./components/Login";
import Chat from "./components/Chat";

function App() {
  const [userName, setUserName] = useState("");

  return (
    <div className="main" id="wrapper">
      {userName ? (
        <Chat userName={userName} />
      ) : (
        <Login setUserName={setUserName} />
      )}
    </div>
  );
}

export default App;