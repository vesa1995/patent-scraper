const axios = require("axios");

async function getWindSpeedAtCurrentLocation() {
  const { latitude, longitude } = await getCurrentLocation();
  const forecast = await getForecast(latitude, longitude);

  const nearestForecast = forecast[0];
  return nearestForecast.wind;
}

async function getCurrentLocation() {
  const response = await axios.get("https://freegeoip.app/json/");

  const { latitude, longitude } = response.data;

  return {
    latitude,
    longitude,
  };
}

async function getForecast(latitude, longitude) {
  function presentForecastItem(item) {
    return {
      wind: {
        direction: item.wind10m.direction,
        speed: item.wind10m.speed,
      },
    };
  }

  const response =
      await axios.get(`http://www.7timer.info/bin/astro.php?lon=${longitude}&lat=${latitude}&ac=0&unit=metric&output=json&tzshift=0`);

  return response.data.dataseries.map(presentForecastItem);
}

module.exports = {
  getWindSpeedAtCurrentLocation,
};
