/* ================= SUPABASE INIT ================= */

const SUPABASE_URL = "https://cwsjwwgytejmgqrdyeuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nDNfslXg1irQsDT70F_5Xg_zhnjvVXV";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* ================= AUTH GUARD ================= */

(async function checkAuth() {
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) {
    window.location.href = "auth.html";
  }
})();

/* ================= TOAST ================= */

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ================= SAVE WEATHER HISTORY ================= */

async function saveWeatherHistoryIfLoggedIn(weatherData) {
  try {
    const { data: authData } = await supabaseClient.auth.getUser();
    const user = authData?.user;

    if (!user) {
      console.log("No user logged in, skipping history save");
      return;
    }

    const { error } = await supabaseClient
      .from("farmer_history")
      .insert({
        user_id: user.id,
        location: weatherData.city,
        alert_type: weatherData.alertMessage,
        temperature: weatherData.temperature,
        rainfall: weatherData.rainfall,
        crop_advice: "Weather-based crop guidance"
      });

    if (error) {
      console.error("History save failed:", error.message);
    } else {
      showToast("Weather saved to history 🌾");
    }
  } catch (err) {
    console.error("Unexpected history error:", err);
  }
}

/* ================= LOGOUT ================= */

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "auth.html";
}

/* ================= WEATHER BY CITY ================= */

async function getWeatherAlert() {
  const city = document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const loadingDiv = document.getElementById("loading");

  resultDiv.classList.remove("visible");
  errorDiv.classList.remove("visible");
  loadingDiv.classList.add("visible");

  if (!city) {
    loadingDiv.classList.remove("visible");
    errorDiv.textContent = "⚠️ Please enter a city name";
    errorDiv.classList.add("visible");
    return;
  }

  try {
    const response = await fetch(`/weather-alert?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    loadingDiv.classList.remove("visible");

    if (!response.ok) {
      errorDiv.innerHTML = `<strong>Error:</strong> ${data.message || "Failed to fetch weather"}`;
      errorDiv.classList.add("visible");
      return;
    }

    displayWeather(data);
    await saveWeatherHistoryIfLoggedIn(data);

  } catch (error) {
    loadingDiv.classList.remove("visible");
    errorDiv.textContent = "⚠️ Network error. Try again.";
    errorDiv.classList.add("visible");
  }
}

/* ================= WEATHER BY LOCATION ================= */

function getLocationWeather() {
  const locationInfo = document.getElementById("locationInfo");

  if (!navigator.geolocation) {
    locationInfo.textContent = "📍 Geolocation not supported";
    return;
  }

  locationInfo.textContent = "📍 Detecting your location...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `/weather-alert?lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        displayWeather(data);
        await saveWeatherHistoryIfLoggedIn(data);

        locationInfo.textContent = "📍 Location detected";
      } catch (err) {
        locationInfo.textContent = "📍 Failed to fetch weather";
      }
    },
    () => {
      locationInfo.textContent = "📍 Permission denied";
    }
  );
}

/* ================= DISPLAY WEATHER ================= */

function displayWeather(data) {
  const resultDiv = document.getElementById("result");

  let alertClass = "alert-normal";
  if (data.alertMessage.includes("Heat")) alertClass = "alert-heat";
  else if (data.alertMessage.includes("Cold")) alertClass = "alert-cold";
  else if (data.alertMessage.includes("Rain")) alertClass = "alert-rain";
  else if (data.alertMessage.includes("Storm")) alertClass = "alert-storm";

  resultDiv.innerHTML = `
    <div class="result-title">${data.alertMessage}</div>
    <div class="result-grid">
      <div class="data-item"><b>Location</b><br>${data.city}</div>
      <div class="data-item"><b>Temperature</b><br>${data.temperature}°C</div>
      <div class="data-item"><b>Rainfall</b><br>${data.rainfall} mm</div>
      <div class="data-item"><b>Wind</b><br>${data.windSpeed} km/h</div>
      <div class="data-item"><b>Humidity</b><br>${data.humidity}%</div>
    </div>
  `;

  resultDiv.className = `result visible ${alertClass}`;
}
