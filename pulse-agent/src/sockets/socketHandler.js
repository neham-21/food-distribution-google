const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(
      "Client connected:",
      socket.id
    );

    socket.emit(
      "pulse/status",
      {
        status:
          "Pulse Agent Connected",
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Client disconnected:",
          socket.id
        );
      }
    );
  });
};

export default setupSocket;