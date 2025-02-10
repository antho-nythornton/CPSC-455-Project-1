const WebSocketServer = require("websocket").server;
const http = require("http");

const webSocketsServerPort = 8000;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running.");
});

// Listen on all network interfaces
server.listen(webSocketsServerPort, "0.0.0.0", () => {
  console.log(`Listening on port ${webSocketsServerPort}...`);
});

// Create WebSocket server
const wsServer = new WebSocketServer({
  httpServer: server,
});

// Store connected users
const connectedUsers = {};

wsServer.on("request", function (request) {
  console.log("Connection request from:", request.host);
  const connection = request.accept(null, request.host);

  const userId = `user-${Math.random().toString(16).slice(2)}`;
  connectedUsers[userId] = connection;
  console.log(`User connected: ${userId}`);

  connection.on("message", function (message) {
    try {
      const data = JSON.parse(message.utf8Data);

      if (data.type === "message") {
        console.log(`Received message from ${data.userName}: ${data.message}`);

        // Broadcast the message to all connected users
        for (let user in connectedUsers) {
          connectedUsers[user].sendUTF(
            JSON.stringify({
              userName: data.userName,
              message: data.message,
            })
          );
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  connection.on("close", function () {
    console.log(`User disconnected: ${userId}`);
    delete connectedUsers[userId];
  });
});
