import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = e2e7f8aea6cb5efacfb2b0dc55739588;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
        () => setError("Location access denied. Please enter city manually.")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        setCity(data.name);
        fetchForecast(data.name);
        setBackground(data.weather[0].main);
        setError("");
      } else {
        setError("Unable to fetch weather data.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        fetchForecast(city);
        setBackground(data.weather[0].main);
        setError("");
      } else {
        setError("City not found. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const setBackground = (weatherCondition) => {
    const body = document.body;
    const backgrounds = {
      Clear: "linear-gradient(145deg, #f5b7b1, #ffcccb)",
      Rain: "linear-gradient(145deg, #3b6e91, #4f9bbf)",
      Clouds: "linear-gradient(145deg, #a2b9bc, #b5d6d1)",
      Snow: "linear-gradient(145deg, #a6c8e5, #cce1f2)"
    };
    body.style.background = backgrounds[weatherCondition] || "linear-gradient(145deg, #ff7e5f, #feb47b)";
  };

  const fetchForecast = async (cityName) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      if (response.ok) {
        const dailyForecast = processForecastData(data.list);
        setForecast(dailyForecast);
      } else {
        setError("Unable to fetch forecast data.");
      }
    } catch (err) {
      setError("An error occurred while fetching forecast.");
    }
  };

  const processForecastData = (list) => {
    const dailyTemps = {};
    list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyTemps[date]) {
        dailyTemps[date] = { min: item.main.temp_min, max: item.main.temp_max };
      } else {
        dailyTemps[date].min = Math.min(dailyTemps[date].min, item.main.temp_min);
        dailyTemps[date].max = Math.max(dailyTemps[date].max, item.main.temp_max);
      }
    });
    return Object.entries(dailyTemps)
      .slice(1, 6)
      .map(([date, temps]) => ({ date, min: temps.min, max: temps.max })) || [];
  };

  const getRecommendation = () => {
    if (!weather) return "";
    const temp = weather.main.temp;
    if (temp < 10) return "It's cold! Consider wearing a warm jacket and scarf.";
    if (temp >= 10 && temp < 20) return "It's cool. A light jacket will do.";
    if (temp >= 20 && temp < 30) return "The weather is pleasant. A t-shirt should be enough.";
    return "It's hot! Stay hydrated and wear light clothes.";
  };

  return (
    <div className="app">
      <div className="weather-container">
        <h1 className="app-title">Weather App</h1>
        <div className="search-container">
          <input type="text" placeholder="Enter city name" value={city} onChange={(e) => setCity(e.target.value)} onKeyPress={(e) => e.key === "Enter" && fetchWeather()} />
          <button onClick={fetchWeather}>Search</button>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="main-content">
          {weather && (
            <div className="weather-info">
              <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
              <div className="weather-main">
                <img src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} />
                <p className="temperature">{Math.round(weather.main.temp)}°C</p>
              </div>
              <p className="weather-description">{weather.weather[0].description}</p>
              <div className="weather-details">
                <a>Humidity: {weather.main.humidity}% </a> <a>Wind: {weather.wind.speed} m/s</a>
              </div>
            </div>
          )}
          {weather && forecast.length > 0 && (
            <div className="today-temp">
              <p>Today's Max Temp: {Math.round(forecast[0].max)}°C</p>
              <p>Today's Min Temp: {Math.round(forecast[0].min)}°C</p>
            </div>
          )}
          {forecast.length > 0 && (
            <div className="forecast-container">
              <h2>5-Day Forecast</h2>
              <div className="forecast">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <p className="forecast-date">{day.date}</p>
                    <p>Min: {Math.round(day.min)}°C</p>
                    <p>Max: {Math.round(day.max)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="recommendation">
          <h2>Today's Recommendation</h2>
          <div className="recommendation-card">
            <p>{getRecommendation()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
