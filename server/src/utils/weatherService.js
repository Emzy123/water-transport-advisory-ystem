const axios = require('axios');
const prisma = require('./prisma');

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache = null;

function buildAdvisory(wind, rain, vis) {
  let type = 'info';
  let text = '';

  if (wind > 40 || vis < 1) {
    type = 'warning';
    text = `NAVIGATION WARNING: Wind ${wind} km/h, visibility ${vis.toFixed(1)} km. All vessels reduce speed and exercise extreme caution.`;
  } else if (wind > 25 || rain > 5) {
    type = 'caution';
    text = `CAUTION: Wind ${wind} km/h, rainfall ${rain} mm/hr. Monitor conditions closely.`;
  } else {
    text = `Conditions favourable. Wind: ${wind} km/h, Rain: ${rain} mm/hr, Visibility: ${vis.toFixed(1)} km.`;
  }

  return { type, text, wind, rain, visibility: vis };
}

async function fetchWeather(lat = 7.8, lon = 6.73, location = 'Niger-Benue Corridor') {
  const now = Date.now();
  if (cache && cache.expiresAt > now && cache.lat === lat && cache.lon === lon) {
    return { ...cache.data, stale: false };
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      '&current=wind_speed_10m,precipitation,visibility,weathercode&wind_speed_unit=kmh';
    const { data } = await axios.get(url, { timeout: 10000 });
    const c = data.current;
    const wind = c.wind_speed_10m;
    const rain = c.precipitation;
    const vis = c.visibility / 1000;
    const advisory = buildAdvisory(wind, rain, vis);

    const result = {
      location,
      wind,
      rain,
      visibility: vis,
      type: advisory.type,
      text: advisory.text,
      stale: false,
    };

    cache = { data: result, expiresAt: now + CACHE_TTL_MS, lat, lon };

    await prisma.weatherAdvisory.create({
      data: {
        location,
        windSpeed: wind,
        precipitation: rain,
        visibility: vis,
        advisoryType: advisory.type,
        advisoryText: advisory.text,
      },
    });

    return result;
  } catch (err) {
    if (cache?.data) {
      return { ...cache.data, stale: true };
    }

    const last = await prisma.weatherAdvisory.findFirst({
      orderBy: { generatedAt: 'desc' },
    });

    if (last) {
      return {
        location: last.location,
        wind: last.windSpeed,
        rain: last.precipitation,
        visibility: last.visibility,
        type: last.advisoryType,
        text: last.advisoryText,
        stale: true,
      };
    }

    throw err;
  }
}

module.exports = { fetchWeather, buildAdvisory };
