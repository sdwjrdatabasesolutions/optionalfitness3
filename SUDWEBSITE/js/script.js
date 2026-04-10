// 1. Configuration
const SUPABASE_URL = 'https://khrmuxatxihvthxrmjyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtocm11eGF0eGlodnRoeHJtanlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mzc5MjAsImV4cCI6MjA5MTQxMzkyMH0.TfZZH11o_oC2cvTOCaVJiZMTjgx9vPjDGT0Xb5yHHQk';

// 2. Initialize the Supabase Client
// Library is loaded via CDN in HTML, making 'supabase' globally available
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("SDWSR University Supabase initialized!");

async function signUp(email) {
  if (!email || !email.includes('@')) {
    alert("Please enter a valid email address.");
    return;
  }

  // Visual feedback for the student
  const joinBtn = document.getElementById('join-btn');
  const originalText = joinBtn.innerText;
  joinBtn.innerText = "Sending...";
  joinBtn.disabled = true;

  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: window.location.origin, 
    },
  });

  if (error) {
    console.error("Auth Error:", error.message);
    alert("Error: " + error.message);
    joinBtn.innerText = originalText;
    joinBtn.disabled = false;
  } else {
    alert("Success! Check your email for your SDWSR login link.");
    document.getElementById('studentEmail').value = ""; // Clear input
    joinBtn.innerText = "Check Email";
  }
}

// 3. Event Listener
document.addEventListener('DOMContentLoaded', () => {
  const joinBtn = document.getElementById('join-btn');
  const emailInput = document.getElementById('studentEmail');

  if (joinBtn && emailInput) {
    joinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signUp(emailInput.value);
    });
  }
});