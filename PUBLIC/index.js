// ---------- SUPABASE INIT ----------
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XXXX";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ---------- WEATHER FETCH ----------
async function fetchWeather(city) {
  try {
    const res = await fetch(`/weather-alert?city=${city}`);
    const data = await res.json();

    // update UI (your existing UI code stays here)

    // 🔥 SAVE HISTORY HERE
    saveWeatherHistoryIfLoggedIn(data);

  } catch (err) {
    console.error("Weather error:", err);
  }
}

// ---------- SAVE HISTORY ----------
async function saveWeatherHistoryIfLoggedIn(data) {
  const { data: authData } = await supabaseClient.auth.getUser();

  if (!authData?.user) {
    console.log("No user logged in, skipping history save");
    return;
  }

  const result = await supabaseClient.from("farmer_history").insert({
    user_id: authData.user.id,
    location: data.city,
    alert_type: data.alertMessage,
    temperature: data.temperature,
    rainfall: data.rainfall,
    crop_advice: "Weather-based crop guidance",
  });

  console.log("History saved:", result);
}
