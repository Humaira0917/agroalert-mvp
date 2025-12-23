const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 5000;
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/auth.html");
});
app.use(express.static("public"));

app.get("/weather-alert", async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({
      error: "Provide city or coordinates",
    });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const params = {
      appid: apiKey,
      units: "metric",
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      params.q = city;
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      { params }
    );

    const w = response.data;

    let alertMessage = "Weather Normal";
    if (w.main.temp > 38) alertMessage = "Heat Alert";
    else if (w.main.temp < 10) alertMessage = "Cold Alert";
    else if (w.rain && w.rain["1h"] > 50) alertMessage = "Heavy Rain Alert";
    else if (w.wind.speed * 3.6 > 40) alertMessage = "Storm Warning";

    res.json({
      city: w.name,
      temperature: w.main.temp,
      rainfall: w.rain ? w.rain["1h"] : 0,
      windSpeed: (w.wind.speed * 3.6).toFixed(2),
      humidity: w.main.humidity,
      alertMessage,
    });
  } catch (err) {
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌾 Server running on http://localhost:${PORT}`);
});
