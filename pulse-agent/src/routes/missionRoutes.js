import express from "express";

import { startMission } from "../controllers/missionController.js";

const missionRoutes = (io) => {
  const router =
    express.Router();

  router.post(
    "/start",
    async (req, res) => {
      await startMission(
        req,
        res,
        io
      );
    }
  );

  return router;
};

export default missionRoutes;