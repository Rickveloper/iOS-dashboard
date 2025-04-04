// script.js
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("time").textContent = `${hours}:${minutes}`;
  document.getElementById("date").textContent = now.toDateString();

  const vibe = getVibe(now);
  document.getElementById("vibe").textContent = `Vibe Check: ${vibe}`;
}

function getVibe(now) {
  const hour = now.getHours();
  if (hour < 6) return "Night Owl";
  if (hour < 12) return "Coffee Needed";
  if (hour < 18) return "Getting Stuff Done";
  if (hour < 22) return "Chillin'";
  return "Low Battery";
}

setInterval(updateTime, 1000);
updateTime();
