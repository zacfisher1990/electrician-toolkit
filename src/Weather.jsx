import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, MapPin, Loader } from 'lucide-react';

const Weather = ({ isDarkMode }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [showZipInput, setShowZipInput] = useState(false);

  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    text: isDarkMode ? '#f9fafb' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#4b5563' : '#e5e7eb',
    inputBg: isDarkMode ? '#1f2937' : '#f9fafb',
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain size={32} color="#3b82f6" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow size={32} color="#3b82f6" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud size={32} color="#6b7280" />;
    } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun size={32} color="#f59e0b" />;
    }
    return <Cloud size={32} color="#6b7280" />;
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Weather data unavailable');
      }
      
      const data = await response.json();
      
      // Fetch 3-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();
      
      // Get one forecast per day (noon)
      const dailyForecasts = forecastData.list.filter((item, index) => 
        index % 8 === 4
      ).slice(0, 3);
      
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        location: data.name,
        forecast: dailyForecasts.map(day => ({
          day: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.main.temp),
          condition: day.weather[0].main
        }))
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchWeatherByZip = async (zip) => {
    try {
      setLoading(true);
      setError(null);
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.message) {
          throw new Error(data.message);
        }
        throw new Error('Invalid zip code or API error');
      }
      
      // Fetch 3-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&units=imperial&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();
      
      const dailyForecasts = forecastData.list.filter((item, index) => 
        index % 8 === 4
      ).slice(0, 3);
      
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        location: data.name,
        forecast: dailyForecasts.map(day => ({
          day: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.main.temp),
          condition: day.weather[0].main
        }))
      });
      setLoading(false);
      setShowZipInput(false);
      setError(null);
      localStorage.setItem('weatherZipCode', zip);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Unable to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user previously entered a zip code
    const savedZip = localStorage.getItem('weatherZipCode');
    
    if (savedZip) {
      fetchWeatherByZip(savedZip);
    } else {
      // Try geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (err) => {
            setLocationDenied(true);
            setShowZipInput(true);
            setLoading(false);
          }
        );
      } else {
        setLocationDenied(true);
        setShowZipInput(true);
        setLoading(false);
      }
    }
  }, []);

  const handleZipSubmit = () => {
    if (zipCode.match(/^\d{5}$/)) {
      fetchWeatherByZip(zipCode);
    } else {
      setError('Please enter a valid 5-digit zip code');
    }
  };

  if (loading) {
    return (
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px'
      }}>
        <Loader size={24} color={colors.subtext} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (showZipInput || (locationDenied && !weather)) {
    return (
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: colors.text }}>
          Weather
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: colors.subtext }}>
          Enter your zip code to see weather for your job sites
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleZipSubmit()}
            placeholder="Zip code"
            maxLength="5"
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              background: colors.inputBg,
              color: colors.text,
              fontSize: '0.875rem'
            }}
          />
          <button
            onClick={handleZipSubmit}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Get Weather
          </button>
        </div>
        {error && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: colors.subtext }}>
          Unable to load weather
        </p>
        <button
          onClick={() => setShowZipInput(true)}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Enter Zip Code
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Current Weather */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
            <MapPin size={14} color={colors.subtext} />
            <span style={{ fontSize: '0.875rem', color: colors.subtext }}>{weather.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getWeatherIcon(weather.condition)}
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.text, lineHeight: 1 }}>
                {weather.temp}°F
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.subtext, textTransform: 'capitalize' }}>
                {weather.description}
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: colors.subtext }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
            <Wind size={12} />
            <span>{weather.windSpeed} mph</span>
          </div>
          <div>Humidity {weather.humidity}%</div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: `1px solid ${colors.border}`
      }}>
        {weather.forecast.map((day, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: colors.subtext, marginBottom: '0.25rem' }}>
              {day.day}
            </div>
            <div style={{ margin: '0.25rem 0', display: 'flex', justifyContent: 'center' }}>
              {getWeatherIcon(day.condition)}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text }}>
              {day.temp}°
            </div>
          </div>
        ))}
      </div>

      {/* Change Location Button */}
      <button
        onClick={() => {
          setShowZipInput(true);
          setWeather(null);
        }}
        style={{
          marginTop: '1rem',
          width: '100%',
          padding: '0.5rem',
          background: 'transparent',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          color: colors.subtext,
          fontSize: '0.75rem',
          cursor: 'pointer'
        }}
      >
        Change Location
      </button>
    </div>
  );
};

export default Weather;