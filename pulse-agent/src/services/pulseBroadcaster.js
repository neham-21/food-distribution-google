export const broadcastPulse = (
  io,
  data
) => {
  io.emit(
    "pulse/location",
    data
  );

  console.log(
    "Pulse Broadcast:",
    data.location
  );
};