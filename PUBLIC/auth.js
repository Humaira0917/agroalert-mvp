const SUPABASE_URL = "https://cwsjwwgytejmgqrdyeuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nDNfslXg1irQsDT70F_5Xg_zhnjvVXV";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function sendOTP() {
  const phone = document.getElementById("phone").value.trim();

  if (!phone.startsWith("+")) {
    alert("Enter phone in +91XXXXXXXXXX format");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOtp({
    phone
  });

  if (error) {
    alert(error.message);
  } else {
    alert("OTP sent 📩");
  }
}

async function verifyOTP() {
  const phone = document.getElementById("phone").value.trim();
  const token = document.getElementById("otp").value.trim();

  const { data, error } = await supabaseClient.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error) {
    alert(error.message);
    return;
  }

  // ask primary location once
  const location = prompt("🌾 Enter your village / city (Primary Location)");
  if (location) {
    await supabaseClient.from("farmer_profile").upsert({
      user_id: data.user.id,
      primary_location: location
    });
  }

  window.location.href = "index.html";
}
