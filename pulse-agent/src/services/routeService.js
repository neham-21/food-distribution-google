import axios from "axios";

const ORS_BASE_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

export const getRoute = async (
  start,
  end
) => {
  try {
    const response = await axios.post(
      ORS_BASE_URL,

      {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
      },

      {
        headers: {
          Authorization:
            process.env.ORS_API_KEY,

          "Content-Type":
            "application/json",
        },
      }
    );

    const route =
      response.data.features[0];

    const coordinates =
      route.geometry.coordinates.map(
        (coord) => ({
          lng: coord[0],
          lat: coord[1],
        })
      );

    return {
      coordinates,

      distance: (
        route.properties.summary
          .distance / 1000
      ).toFixed(2),

      duration: (
        route.properties.summary
          .duration / 60
      ).toFixed(2),
    };
  } catch (error) {
    console.log(
      "ORS ERROR:"
    );

    console.log(
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

export const generateMissionRoutes =
  async (hospital, patient) => {
    const phaseA =
      await getRoute(
        hospital,
        patient
      );

    const phaseB =
      await getRoute(
        patient,
        hospital
      );

    return {
      phaseA,
      phaseB,
    };
  };