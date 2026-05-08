import { broadcastPulse } from "./pulseBroadcaster.js";

export const startSimulation = (
  io,
  mission,
  coordinates
) => {
  let currentIndex = 0;

  const totalCoordinates =
    coordinates.length;

  const interval = setInterval(() => {
    if (
      currentIndex >= totalCoordinates
    ) {
      clearInterval(interval);

      io.emit(
        "pulse/status",
        {
          missionId:
            mission.missionId,

          status:
            "MISSION_COMPLETE",
        }
      );

      console.log(
        "Mission Completed"
      );

      return;
    }

    const currentLocation =
      coordinates[currentIndex];

    const remaining =
      totalCoordinates -
      currentIndex;

    const eta =
      Math.ceil(remaining / 2);

    const payload = {
      missionId:
        mission.missionId,

      ambulanceId:
        mission.ambulanceId,

      location:
        currentLocation,

      status:
        "EN_ROUTE_PATIENT",

      eta: `${eta} mins`,

      timestamp:
        new Date(),
    };

    broadcastPulse(
      io,
      payload
    );

    currentIndex++;
  }, 1000);
};