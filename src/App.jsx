import React, { useState, useEffect } from 'react';
import WeatherBackground from './components/WeatherBackground';
import {
  WindIcon,
  HumidityIcon,
  VisibilityIcon,
  SunriseIcon,
  SunsetIcon,
  PressureIcon,
  SearchIcon,
  LocationIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  RainIcon,
  ThunderIcon,
  SnowIcon
} from './components/Icons';
import {
  getWindDirection,
  getHumidityValue,
  getVisibilityValue,
  convertTemperature,
  formatTime,
  mapWmoCode
} from './components/Helper';

// Categorized Quick Cities (Prayagraj & Local, Uttar Pradesh, India Metros, Global)
const CITY_CATEGORIES = {
  prayagraj: {
    label: '📍 Prayagraj & Local',
    cities: ['Prayagraj', 'Naini', 'Phaphamau', 'Jhunsi', 'Handia', 'Karchhana', 'Soraon', 'Mau Aima']
  },
  up: {
    label: '🏛️ Uttar Pradesh',
    cities: ['Lucknow', 'Varanasi', 'Ayodhya', 'Kanpur', 'Noida', 'Gorakhpur', 'Agra', 'Mathura', 'Bareilly', 'Meerut', 'Jhansi', 'Aligarh']
  },
  india: {
    label: '🇮🇳 India Metros',
    cities: ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Chennai', 'Jaipur', 'Ahmedabad', 'Pune', 'Chandigarh']
  },
  global: {
    label: '🌍 Global Cities',
    cities: ['Dubai', 'London', 'New York', 'Tokyo', 'Paris', 'Singapore', 'Sydney']
  }
};

const App = () => {
  const [activeCity, setActiveCity] = useState('Prayagraj');
  const [activeCategory, setActiveCategory] = useState('prayagraj');
  const [searchQuery, setSearchQuery] = useState('');
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Weather with intelligent UP/India disambiguation
  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Geocoding search (get up to 10 results to find closest match)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location "${cityName}" not found. Please try another place.`);
      }

      // Prioritize Uttar Pradesh or India result if matching local query
      let bestMatch = geoData.results[0];
      const upMatch = geoData.results.find(
        (r) => r.admin1?.toLowerCase().includes('uttar pradesh') || r.admin2?.toLowerCase().includes('prayagraj')
      );
      const inMatch = geoData.results.find((r) => r.country_code === 'IN');

      if (upMatch) {
        bestMatch = upMatch;
      } else if (inMatch) {
        bestMatch = inMatch;
      }

      const { latitude, longitude, name, country, admin1, admin2 } = bestMatch;

      // 2. Fetch current weather and 7-day forecast
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
      );
      const data = await weatherRes.json();

      const current = data.current;
      const daily = data.daily;
      const conditionInfo = mapWmoCode(current.weather_code);

      // Display title (e.g. Naini, Prayagraj, UP or Lucknow, UP, India)
      const locationSub = [admin2, admin1, country].filter(Boolean).slice(0, 2).join(', ');

      setWeatherData({
        city: name,
        locationDetail: locationSub,
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        pressure: current.surface_pressure,
        visibility: 10000,
        condition: conditionInfo.main,
        description: conditionInfo.description,
        isDay: Boolean(current.is_day),
        tempMax: daily.temperature_2m_max[0],
        tempMin: daily.temperature_2m_min[0],
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0]
      });

      // 5-day forecast
      const forecastDays = [];
      for (let i = 1; i <= 5; i++) {
        if (daily.time[i]) {
          const date = new Date(daily.time[i]);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayCondition = mapWmoCode(daily.weather_code[i]);
          forecastDays.push({
            day: dayName,
            maxTemp: daily.temperature_2m_max[i],
            minTemp: daily.temperature_2m_min[i],
            condition: dayCondition.main,
            description: dayCondition.description
          });
        }
      }
      setForecast(forecastDays);
      setActiveCity(cityName);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Prayagraj');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleQuickCityClick = (cityName) => {
    fetchWeather(cityName);
  };

  const getWeatherIcon = (condition, isDay = true, size = 48) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder')) return <ThunderIcon size={size} />;
    if (c.includes('rain') || c.includes('drizzle')) return <RainIcon size={size} />;
    if (c.includes('snow')) return <SnowIcon size={size} />;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('haze')) return <CloudIcon size={size} />;
    return isDay ? <SunIcon size={size} /> : <MoonIcon size={size} />;
  };

  return (
    <>
      {/* Dynamic Animated Background */}
      <WeatherBackground 
        condition={weatherData?.condition || 'Clear'} 
        isNight={weatherData ? !weatherData.isDay : false} 
      />

      <div className="app-wrapper">
        {/* Header */}
        <header className="app-header">
          <div className="brand-title">
            <span role="img" aria-label="weather">🌤️</span>
            <span>SkyCast <span className="brand-gradient">Weather Live</span></span>
          </div>

          <div className="unit-toggle">
            <button 
              className={`unit-btn ${unit === 'C' ? 'active' : ''}`}
              onClick={() => setUnit('C')}
            >
              °C
            </button>
            <button 
              className={`unit-btn ${unit === 'F' ? 'active' : ''}`}
              onClick={() => setUnit('F')}
            >
              °F
            </button>
          </div>
        </header>

        {/* Global Live Search Bar */}
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-input-wrapper">
            <div className="search-icon-inside">
              <SearchIcon size={20} />
            </div>
            <input
              type="text"
              placeholder="Duniya ka koi bhi shehar search karein (e.g. Prayagraj, Naini, Lucknow, Ayodhya, Delhi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        {/* Category Filter Tabs */}
        <div className="category-tabs">
          {Object.entries(CITY_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              className={`cat-tab-btn ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* 1-Click Quick City Pills for Active Category */}
        <div className="quick-cities">
          {CITY_CATEGORIES[activeCategory].cities.map((c) => {
            const isSelected = activeCity.toLowerCase() === c.toLowerCase();
            return (
              <button 
                key={c} 
                className={`city-pill ${isSelected ? 'active' : ''}`} 
                onClick={() => handleQuickCityClick(c)}
              >
                {isSelected && <span className="city-pill-dot"></span>}
                {c}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="glass-card status-box">
            <div className="loader"></div>
            <p>Fetching real-time satellite weather for {activeCity}...</p>
          </div>
        )}

        {/* Error Box */}
        {error && !loading && (
          <div className="glass-card status-box">
            <p className="error-text">⚠️ {error}</p>
          </div>
        )}

        {/* Weather Main Content */}
        {!loading && !error && weatherData && (
          <>
            {/* Hero Card */}
            <div className="glass-card weather-hero">
              <div className="hero-city-info">
                <h2>
                  <LocationIcon size={28} />
                  {weatherData.city}
                </h2>
                <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                  {weatherData.locationDetail}
                </div>
                <div className="hero-date">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>

                <div className="hero-temp-row">
                  <div className="hero-temp">
                    {convertTemperature(weatherData.temp, unit)}°{unit}
                  </div>
                  <div>
                    <span className="hero-condition-badge">
                      {weatherData.description}
                    </span>
                    <div className="hero-feels-like">
                      Feels like {convertTemperature(weatherData.feelsLike, unit)}°{unit}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="condition-icon-big">
                  {getWeatherIcon(weatherData.condition, weatherData.isDay, 110)}
                </div>
                <div style={{ marginTop: '10px', fontSize: '1rem', color: '#cbd5e1' }}>
                  H: {convertTemperature(weatherData.tempMax, unit)}° • L: {convertTemperature(weatherData.tempMin, unit)}°
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-box">
                  <HumidityIcon size={24} />
                </div>
                <div>
                  <div className="metric-label">Humidity</div>
                  <div className="metric-value">{weatherData.humidity}%</div>
                  <div className="metric-sub">{getHumidityValue(weatherData.humidity)}</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <WindIcon size={24} />
                </div>
                <div>
                  <div className="metric-label">Wind</div>
                  <div className="metric-value">{Math.round(weatherData.windSpeed)} km/h</div>
                  <div className="metric-sub">Dir: {getWindDirection(weatherData.windDirection)}</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <VisibilityIcon size={24} />
                </div>
                <div>
                  <div className="metric-label">Visibility</div>
                  <div className="metric-value">{getVisibilityValue(weatherData.visibility)}</div>
                  <div className="metric-sub">Clear view</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <PressureIcon size={24} />
                </div>
                <div>
                  <div className="metric-label">Pressure</div>
                  <div className="metric-value">{Math.round(weatherData.pressure)} hPa</div>
                  <div className="metric-sub">Barometric</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <SunriseIcon size={24} />
                </div>
                <div>
                  <div className="metric-label">Sunrise</div>
                  <div className="metric-value">{formatTime(weatherData.sunrise)}</div>
                  <div className="metric-sub">Bhor / Subah</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box">
                  <SunsetIcon size={24} />
                </div>
                <div>
                  <div className="metric-label">Sunset</div>
                  <div className="metric-value">{formatTime(weatherData.sunset)}</div>
                  <div className="metric-sub">Shaam / Sandhya</div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="glass-card forecast-section">
              <div className="forecast-title">
                <span>📅</span> 5-Day Weather Forecast
              </div>

              <div className="forecast-grid">
                {forecast.map((item, idx) => (
                  <div key={idx} className="forecast-card">
                    <div className="forecast-day">{item.day}</div>
                    <div>{getWeatherIcon(item.condition, true, 36)}</div>
                    <div className="forecast-temp">
                      {convertTemperature(item.maxTemp, unit)}°
                      <span className="forecast-temp-min"> / {convertTemperature(item.minTemp, unit)}°</span>
                    </div>
                    <div className="forecast-condition">{item.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p>Real-Time Weather Intelligence • Live Global Satellite Telemetry</p>
        </footer>
      </div>
    </>
  );
};

export default App;
