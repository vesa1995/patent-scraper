const freeGeoIp = require("../integration/freeGeoIp");
const timer7WeatherForecast = require("../integration/timer7WeatherForecast");

async function getWindSpeedAtCurrentLocation() {
  const { latitude, longitude } = await freeGeoIp.getCurrentLocation();
  const forecast = await timer7WeatherForecast.getForecast(latitude, longitude);

  const nearestForecast = forecast[0];
  return nearestForecast.wind;
}

module.exports = {
  getWindSpeedAtCurrentLocation,
};
