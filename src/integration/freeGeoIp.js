const axios = require("axios");

async function getCurrentLocation() {
  const response = await axios.get("https://freegeoip.app/json/");

  const { latitude, longitude } = response.data;

  return {
    latitude,
    longitude,
  };
}

module.exports = {
  getCurrentLocation,
};
