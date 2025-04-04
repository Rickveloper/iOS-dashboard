// script.js

async function initDashboard() {
  updateTime();
  showSavedNote();
  getBattery();
  await getWeather();
  setInterval(updateTime, 1000);
}

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
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const lat = position.coords.latitude.toFixed(4);
    const lon = position.coords.longitude.toFixed(4);

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=fahrenheit`);
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current.temperature_2m);
    const code = weatherData.current.weathercode;

    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const geoData = await geoRes.json();
    const location = geoData.address.city || geoData.address.town || geoData.address.state || "your area";

    const emoji = getWeatherEmoji(code);
    document.getElementById("weather").textContent = `Weather: ${temp}°F ${emoji} in ${location}`;
  } catch (err) {
    console.error("Weather fetch failed:", err);
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
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

initDashboard();