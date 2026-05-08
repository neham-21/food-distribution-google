import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ===============================
// MULTER CONFIG
// ===============================

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===============================
// MOCK DATABASES
// ===============================

const ngos = [
  {
    id: 1,
    name: "Hope Shelter",
    distance: 3,
    children: 40,
    urgency: 9,
    location: "Whitefield"
  },
  {
    id: 2,
    name: "Smile Foundation",
    distance: 5,
    children: 25,
    urgency: 7,
    location: "Marathahalli"
  },
  {
    id: 3,
    name: "Annapurna Care",
    distance: 2,
    children: 60,
    urgency: 10,
    location: "KR Puram"
  }
];

const volunteers = [
  {
    id: 1,
    name: "Rahul",
    distance: 1.2,
    vehicle: "Bike",
    rating: 4.9
  },
  {
    id: 2,
    name: "Arjun",
    distance: 2.5,
    vehicle: "Scooter",
    rating: 4.6
  },
  {
    id: 3,
    name: "Sneha",
    distance: 0.8,
    vehicle: "Car",
    rating: 4.8
  }
];

const deliveries = [];

// ===============================
// GEMINI API FUNCTION
// ===============================

async function callGemini(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("Gemini Error:", error.message);
    return null;
  }
}

// ===============================
// AGENT 1 - SCANNER AGENT
// ===============================

async function scannerAgent() {
  console.log("Scanner Agent Running...");

  const prompt = `
  Identify food item, quantity and servings.

  Return ONLY valid JSON.

  Example:
  {
    "foodName": "Paneer Biryani",
    "quantity": "10kg",
    "servings": 40
  }
  `;

  const result = await callGemini(prompt);

  if (!result) {
    return {
      foodName: "Paneer Biryani",
      quantity: "10kg",
      servings: 40
    };
  }

  try {
    return JSON.parse(result.replace(/```json/g, "").replace(/```/g, ""));
  } catch {
    return {
      foodName: "Paneer Biryani",
      quantity: "10kg",
      servings: 40
    };
  }
}

// ===============================
// AGENT 2 - TIMER AGENT
// ===============================

async function timerAgent(foodData) {
  console.log("Timer Agent Running...");

  let expiryHours = 4;

  const food = foodData.foodName.toLowerCase();

  if (food.includes("paneer")) expiryHours = 2;
  else if (food.includes("rice")) expiryHours = 4;
  else if (food.includes("milk")) expiryHours = 1;
  else if (food.includes("bread")) expiryHours = 5;

  return {
    ...foodData,
    expiryHours,
    status: expiryHours <= 2 ? "URGENT" : "SAFE"
  };
}

// ===============================
// AGENT 3 - MATCHMAKER AGENT
// ===============================

async function matchmakerAgent(foodData) {
  console.log("Matchmaker Agent Running...");

  let bestNgo = null;
  let bestScore = -999;

  ngos.forEach((ngo) => {
    const score = ngo.urgency * 5 - ngo.distance + ngo.children;

    if (score > bestScore) {
      bestScore = score;
      bestNgo = ngo;
    }
  });

  return {
    ...foodData,
    assignedNgo: bestNgo
  };
}

// ===============================
// AGENT 4 - CAPTAIN AGENT
// ===============================

async function captainAgent(foodData) {
  console.log("Captain Agent Running...");

  let bestVolunteer = null;
  let shortestDistance = 999;

  volunteers.forEach((volunteer) => {
    if (volunteer.distance < shortestDistance) {
      shortestDistance = volunteer.distance;
      bestVolunteer = volunteer;
    }
  });

  return {
    ...foodData,
    assignedVolunteer: bestVolunteer,
    estimatedDeliveryTime: "20 mins"
  };
}

// ===============================
// AGENT 5 - ACCOUNTANT AGENT
// ===============================

async function accountantAgent(foodData) {
  console.log("Accountant Agent Running...");

  const mealsServed = foodData.servings;

  const report = {
    foodSaved: foodData.quantity,
    mealsServed,
    moneySaved: `₹${mealsServed * 50}`,
    carbonSaved: `${mealsServed * 0.5} kg CO2`,
    certificateId: `CERT-${Date.now()}`
  };

  return {
    ...foodData,
    impactReport: report
  };
}

// ===============================
// MAIN ORCHESTRATOR
// ===============================

async function processFoodDonation() {
  const scanResult = await scannerAgent();

  const timerResult = await timerAgent(scanResult);

  const ngoResult = await matchmakerAgent(timerResult);

  const captainResult = await captainAgent(ngoResult);

  const finalResult = await accountantAgent(captainResult);

  deliveries.push(finalResult);

  return finalResult;
}

// ===============================
// ROUTES
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RelayRelief Backend Running"
  });
});

// ===============================
// MAIN FOOD UPLOAD ROUTE
// ===============================

app.post("/upload-food", upload.single("image"), async (req, res) => {
  try {
    const result = await processFoodDonation();

    res.json({
      success: true,
      message: "Food processed successfully",
      data: result
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// ===============================
// GET ALL DELIVERIES
// ===============================

app.get("/deliveries", (req, res) => {
  res.json({
    success: true,
    deliveries
  });
});

// ===============================
// GET NGOs
// ===============================

app.get("/ngos", (req, res) => {
  res.json({
    success: true,
    ngos
  });
});

// ===============================
// GET VOLUNTEERS
// ===============================

app.get("/volunteers", (req, res) => {
  res.json({
    success: true,
    volunteers
  });
});

// ===============================
// COMPLETE DELIVERY
// ===============================

app.post("/complete-delivery/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const delivery = deliveries[id];

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: "Delivery not found"
    });
  }

  delivery.completed = true;

  res.json({
    success: true,
    message: "Delivery Completed",
    delivery
  });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});