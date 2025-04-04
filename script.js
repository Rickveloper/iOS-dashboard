// script.js

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

function getWeather() {
  const apiKey = "YOUR_API_KEY_HERE"; // <-- Replace with your OpenWeatherMap API key
  const city = "Boston"; // You can make this dynamic if you want
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].main;
      document.getElementById("weather").textContent = `Weather: ${temp}°F, ${desc}`;
    })
    .catch(() => {
      document.getElementById("weather").textContent = "Weather: Error";
    });
}

// Initialize dashboard
updateTime();
showSavedNote();
getBattery();
getWeather();
setInterval(updateTime, 1000);