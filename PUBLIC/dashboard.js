const SUPABASE_URL = "https://cwsjwwgytejmgqrdyeuz.supabase.co";
const SUPABASE_KEY = "sb_publishable_nDNfslXg1irQsDT70F_5Xg_zhnjvVXV";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ---------------- AUTH + DASHBOARD ----------------
async function loadDashboard() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "auth.html";
    return;
  }
const name = user.email.split("@")[0];
document.getElementById("welcome").innerText =
  `Welcome farmer, ${name}`;


  loadHistory(user.id);
}

// ---------------- HISTORY ----------------
async function loadHistory(userId) {
  const { data, error } = await supabaseClient
    .from("farmer_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  if (!data || data.length === 0) {
    historyDiv.innerHTML = "<p>No history yet.</p>";
    return;
  }

  data.forEach(h => {
    historyDiv.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin:8px 0;">
        <b>${h.location}</b><br>
        ${h.alert_type}<br>
        Temp: ${h.temperature}°C | Rain: ${h.rainfall}mm<br>
        ${h.crop_advice}<br>
        <small>${new Date(h.created_at).toLocaleString()}</small>
      </div>
    `;
  });
}

// ---------------- BUTTON ACTIONS ----------------
function goToWeather() {
  window.location.href = "index.html";
}

function toggleHistory() {
  document.getElementById("history")
    .scrollIntoView({ behavior: "smooth" });
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "auth.html";
}

// ---------------- START ----------------
loadDashboard();
// Optional: show toast on load
showToast(`Welcome farmer, ${name} 🌾`);
