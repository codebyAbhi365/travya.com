export const getWeatherByCoords = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=7`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Error fetching weather");
  const data = await resp.json();
  const current = data?.current || {};
  const daily = data?.daily || {};
  const dailyForecast = [];
  if (daily.time && daily.time.length > 0) {
    for (let i = 0; i < daily.time.length; i++) {
      dailyForecast.push({
        date: daily.time[i],
        maxTemp: daily.temperature_2m_max[i],
        minTemp: daily.temperature_2m_min[i],
        weatherCode: daily.weather_code[i],
        precipitationChance: daily.precipitation_probability_max[i]
      });
    }
  }
  return {
    weather: {
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        condition: String(current.weather_code ?? "Unknown"),
      },
      daily: dailyForecast,
    },
  };
};


