import React from 'react';

const WeatherBackground = ({ condition = 'Clear', isNight = false }) => {
  const norm = condition.toLowerCase();

  const getBackgroundClass = () => {
    if (norm.includes('thunder') || norm.includes('storm')) return 'bg-thunder';
    if (norm.includes('rain') || norm.includes('drizzle')) return 'bg-rain';
    if (norm.includes('snow') || norm.includes('ice') || norm.includes('flurry')) return 'bg-snow';
    if (norm.includes('cloud') || norm.includes('overcast')) return isNight ? 'bg-clouds-night' : 'bg-clouds-day';
    if (norm.includes('haze') || norm.includes('fog') || norm.includes('mist') || norm.includes('smoke')) return 'bg-haze';
    return isNight ? 'bg-clear-night' : 'bg-clear-day';
  };

  return (
    <div className={`weather-bg-container ${getBackgroundClass()}`}>
      <div className="weather-overlay"></div>
      
      {/* Weather Particle/Effect Elements */}
      {(norm.includes('rain') || norm.includes('drizzle')) && (
        <div className="rain-container">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="raindrop" style={{
              left: `${(i * 4) + Math.random() * 2}%`,
              animationDelay: `${(Math.random() * 1.5).toFixed(2)}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`
            }} />
          ))}
        </div>
      )}

      {norm.includes('snow') && (
        <div className="snow-container">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="snowflake" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.7,
              transform: `scale(${0.4 + Math.random() * 0.8})`
            }}>❄</div>
          ))}
        </div>
      )}

      {norm.includes('thunder') && (
        <div className="lightning-flash"></div>
      )}

      {norm.includes('cloud') && (
        <div className="floating-clouds">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>
      )}

      {norm.includes('clear') && !isNight && (
        <div className="sun-glow"></div>
      )}
    </div>
  );
};

export default WeatherBackground;
