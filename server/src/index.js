const app = require('./app.js')
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT

process.title = "EcommerceApp"

const server = http.createServer(app);

const io = socketIo(server);


let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  socket.on("CartOperation", data => {
      //console.log('CartOperation Recieved')
      io.emit("UpdateProduct", '')
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});



server.listen(port, () => console.log(`Ecommerce server started on port ${port}`));

// app.listen(port, () => {
//     console.log('Ecommerce server started on port ' + port)
    
// })