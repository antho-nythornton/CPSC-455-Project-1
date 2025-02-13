const WebSocketServer = require("websocket").server;
const http = require("http");

// Port that server is listening on
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
const heartbeat = {};
const messageCounts ={};
const RATE_LIMIT = 3;
const TIME_WINDOW = 10 * 10000;
const PING_INTERVAL = 10000;
const TIMEOUT_LIMIT = 15000;

// Checks the amount of messages user sent

const isRateLimited = (userId) => {
  const now = Date.now();
  if(!messageCounts[userId]) {
    messageCounts[userId] = [];
  }
  messageCounts[userId] = messageCounts[userId].filter((timestamp) => now - timestamp <TIME_WINDOW);
  if (messageCounts[userId].length >= RATE_LIMIT) {
    return true;
  }
  messageCounts[userId].push(now);
  return false;
};

// Request Function: says where request is coming from.

wsServer.on("request", function (request) {
  console.log("Connection request from:", request.host);
  const connection = request.accept(null, request.host);

  const userId = `user-${Math.random().toString(16).slice(2)}`;
  connectedUsers[userId] = connection;
  console.log(`User connected: ${userId}`);

  connection.on("message", function (message) {
    try {
      const data = JSON.parse(message.utf8Data);
      if (data.type === "heartbeat") {
        heartbeat[userId] = Date.now();
        return;
      }
      if (data.type === "message") {
        if (isRateLimited(userId)){
          console.log(`Rate limit exceeded for ${userId}`)
          return;
        }

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
    delete heartbeat[userId];
  });
});
setInterval(() => {
  const now = Date.now();
  for (let userId in connectedUsers) {
    // If the user has not sent a heartbeat in the specified timeout
    if (now - heartbeat[userId] > TIMEOUT_LIMIT) {
      console.log(`User ${userId} timed out due to no heartbeat.`);
      connectedUsers[userId].close();
      delete connectedUsers[userId];
      delete heartbeat[userId];
    }
  }
}, PING_INTERVAL);
