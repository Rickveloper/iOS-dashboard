// ===== DASHBOARD CORE =====
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  document.getElementById("time").textContent = `${hours}:${minutes}`;
  document.getElementById("date").textContent = now.toDateString();
  document.getElementById("vibe").textContent = `Vibe Check: ${getVibe(now)}`;
}

function getVibe(now) {
  const hour = now.getHours();
  if (hour < 6) return "Midnight Grind";
  if (hour < 10) return "Coffee Needed";
  if (hour < 14) return "Dialed In";
  if (hour < 18) return "Cruisin'";
  if (hour < 22) return "Chillin'";
  return "Sleep Mode";
}

function saveNote() {
  const note = document.getElementById("note").value;
  localStorage.setItem("quickNote", note);
  showSavedNote();
}

function showSavedNote() {
  const note = localStorage.getItem("quickNote");
  if (note) {
    document.getElementById("saved-note").textContent = `Saved Note: ${note}`;
  }
}

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains("light")) {
    body.classList.remove("light");
    body.classList.add("vapor");
  } else if (body.classList.contains("vapor")) {
    body.classList.remove("vapor");
  } else {
    body.classList.add("light");
  }
}

function getBattery() {
  if ("getBattery" in navigator) {
    navigator.getBattery().then(battery => {
      const percent = Math.round(battery.level * 100);
      document.getElementById("battery").textContent = `Battery: ${percent}%`;
    });
  }
}

async function getWeather() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    );
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=fahrenheit`);
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current.temperature_2m);
    const code = weatherData.current.weathercode;
    const emoji = getWeatherEmoji(code);

    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const geoData = await geoRes.json();

    const location = geoData.address.city || geoData.address.town || geoData.address.state || "your area";
    document.getElementById("weather").textContent = `Weather: ${temp}°F ${emoji} in ${location}`;
  } catch {
    document.getElementById("weather").textContent = "Weather: Unavailable";
  }
}

function getWeatherEmoji(code) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if ([61, 63, 65].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

// ===== SPOTIFY STUFF =====
const SPOTIFY_CLIENT_ID = "32ce0f05d28a499ca29ddc4a3524c14d";
const REDIRECT_URI = "https://rickveloper.github.io/iOS-dashboard/";

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}

function sha256(str) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(str));
}

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function startSpotifyAuth() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await sha256(codeVerifier).then(base64url);
  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    scope: "user-read-playback-state user-read-currently-playing"
  });

  window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function completeSpotifyAuth() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return;

  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const data = await res.json();
  localStorage.setItem("spotify_token", data.access_token);
  history.replaceState(null, "", REDIRECT_URI); // Clean URL
}

async function getNowPlaying() {
  const token = localStorage.getItem("spotify_token");
  if (!token) return;

  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 204 || res.status > 400) return;

  const data = await res.json();
  if (!data || !data.item) return;

  document.getElementById("spotify-login").classList.add("hidden");
  document.getElementById("spotify-nowplaying").classList.remove("hidden");

  document.getElementById("album-art").src = data.item.album.images[1].url;
  document.getElementById("song-name").textContent = data.item.name;
  document.getElementById("artist-name").textContent = data.item.artists.map(a => a.name).join(", ");
}

// ===== INIT =====
(async function initDashboard() {
  updateTime();
  showSavedNote();
  getBattery();
  await getWeather();
  await completeSpotifyAuth();
  await getNowPlaying();
  setInterval(updateTime, 1000);
})();