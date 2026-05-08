import { v4 as uuidv4 } from "uuid";

import { mockMission } from "../data/mockMission.js";

import { generateMissionRoutes } from "../services/routeService.js";

import { startSimulation } from "../services/simulatorService.js";

export const startMission = async (
  req,
  res,
  io
) => {
  try {
    const missionId = uuidv4();

    const routes =
      await generateMissionRoutes(
        mockMission.hospital,
        mockMission.patient
      );

    const missionIntent = {
      missionId,

      ambulanceId:
        mockMission.ambulanceId,

      priority: "CRITICAL",

      status: "DISPATCHED",

      hospital:
        mockMission.hospital,

      patient:
        mockMission.patient,

      phaseA: {
        from: "Hospital",
        to: "Patient",

        distance:
          routes.phaseA.distance,

        duration:
          routes.phaseA.duration,
      },

      phaseB: {
        from: "Patient",
        to: "Hospital",

        distance:
          routes.phaseB.distance,

        duration:
          routes.phaseB.duration,
      },

      createdAt: new Date(),
    };

    io.emit(
      "pulse/intent",
      missionIntent
    );

    startSimulation(
      io,
      missionIntent,
      routes.phaseA.coordinates
    );

    res.status(200).json({
      success: true,

      message:
        "Mission Started Successfully",

      missionIntent,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message:
        "Mission Start Failed",
    });
  }
};