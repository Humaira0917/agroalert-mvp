// 🔑 Supabase credentials
const SUPABASE_URL = "https://cwsjwwgytejmgqrdyeuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nDNfslXg1irQsDT70F_5Xg_zhnjvVXV";

// ✅ IMPORTANT: use supabaseClient, NOT supabase
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById("msg").innerText = error.message;
  } else {
    window.location.href = "dashboard.html";
  }
}
