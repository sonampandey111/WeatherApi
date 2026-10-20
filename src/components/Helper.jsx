export const getWindDirection = (deg) => {
    if (deg === undefined || deg === null) return 'N/A';
    if (deg > 337.5 || deg <= 22.5) return 'N';
    if (deg > 22.5 && deg <= 67.5) return 'NE';
    if (deg > 67.5 && deg <= 112.5) return 'E';
    if (deg > 112.5 && deg <= 157.5) return 'SE';
    if (deg > 157.5 && deg <= 202.5) return 'S';
    if (deg > 202.5 && deg <= 247.5) return 'SW';
    if (deg > 247.5 && deg <= 292.5) return 'W';
    if (deg > 292.5 && deg <= 337.5) return 'NW';
    return 'N';
};

export const getHumidityValue = (humidity) => {
    if (humidity < 30) return 'Low';
    if (humidity < 60) return 'Moderate';
    return 'High';
};

export const getVisibilityValue = (visibility) => {
    if (visibility === undefined || visibility === null) return '10 km';
    const km = visibility > 100 ? visibility / 1000 : visibility;
    return `${km.toFixed(1)} km`;
};

export const convertTemperature = (temp, unit) => {
    if (temp === undefined || temp === null) return '--';
    if (unit === 'F') {
        return (temp * 9 / 5 + 32).toFixed(1);
    }
    return Math.round(temp);
};

export const formatTime = (timestamp, timezoneOffset = 0) => {
    if (!timestamp) return '--:--';
    // If timestamp is in seconds
    const date = typeof timestamp === 'number' && timestamp < 1e11 
        ? new Date(timestamp * 1000) 
        : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const mapWmoCode = (code) => {
    // WMO Weather interpretation codes
    if (code === 0) return { main: 'Clear', description: 'Clear sky' };
    if (code === 1) return { main: 'Clear', description: 'Mainly clear' };
    if (code === 2) return { main: 'Clouds', description: 'Partly cloudy' };
    if (code === 3) return { main: 'Clouds', description: 'Overcast' };
    if ([45, 48].includes(code)) return { main: 'Haze', description: 'Fog / Haze' };
    if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Rain', description: 'Drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: 'Rain', description: 'Rain showers' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Snow', description: 'Snowfall' };
    if ([95, 96, 99].includes(code)) return { main: 'Thunderstorm', description: 'Thunderstorm' };
    return { main: 'Clear', description: 'Clear' };
};
