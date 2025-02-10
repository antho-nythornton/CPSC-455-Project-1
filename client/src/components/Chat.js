import { w3cwebsocket as Socket } from "websocket";
import { useState, useEffect } from "react";

const client = new Socket("ws://127.0.0.1:8000");

const Chat = ({ userName }) => {
  const [myMessage, setMyMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const onSend = () => {
    client.send(
      JSON.stringify({
        type: "message",
        message: myMessage,
        userName,
      })
    );
    setMyMessage("");
  };

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setMessages((messages) => [
        ...messages,
        {
          message: data.message,
          userName: data.userName,
        },
      ]);
    };
  }, []);

  return (
    <>
      <div className="title">Socket Chat: {userName}</div>
      <div className="messages">
        {messages.map((message, key) => (
          <div
            key={key}
            className={`message ${
              userName === message.userName ? "flex-end" : "flex-start"
            }`}
          >
            <section>{message.userName[0].toUpperCase()}</section>
            <h4>{message.userName + ":"}</h4>
            <p>{message.message}</p>
          </div>
        ))}
      </div>

      <div className="bottom form">
        <input
          type="myMessage"
          value={myMessage}
          onChange={(e) => setMyMessage(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && onSend()}
          placeholder="Message"
        ></input>
        <button onClick={onSend}>Send</button>
      </div>
    </>
  );
};
export default Chat;