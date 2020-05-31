const http = require("http").createServer();
const io = require("socket.io")(http);

io.on("connection", (socket) => {
     socket.on("message", (evt) => {
          socket.broadcast.emit("message", evt);
     });
});

io.on("disconnect", (evt) => {
     console.log("disconnect");
});

http.listen(3000);
