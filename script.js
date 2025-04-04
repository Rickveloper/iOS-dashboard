async function getWeather() {
  try {
    // Get user location
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const lat = position.coords.latitude.toFixed(4);
    const lon = position.coords.longitude.toFixed(4);

    // Get weather data
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=fahrenheit`);
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current.temperature_2m);

    // Get city/state
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const geoData = await geoRes.json();
    const location = geoData.address.city || geoData.address.town || geoData.address.state || "your area";

    // Update the DOM
    document.getElementById("weather").textContent = `Weather: ${temp}°F in ${location}`;
  } catch (err) {
    console.error("Weather fetch failed:", err);
    document.getElementById("weather").textContent = "Weather: Unavailable";
  }
}