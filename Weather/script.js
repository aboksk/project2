const apiKey = 'a4372a07e9145fbb51dc550658c4ca36';
let isCelsius = true;

document.addEventListener("DOMContentLoaded", () => {
    getWeatherByLocation();
});
document.addEventListener('click', (e) => {
    const autocompleteList = document.getElementById('autocomplete-list');
    if (!e.target.closest('.autocomplete')) {
        autocompleteList.innerHTML = '';
    }
});
async function getWeatherByCity() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) return alert('Please enter a valid city name.');

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;

    try {
        await fetchWeatherData(weatherUrl);

        await fetchForecastData(forecastUrl);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to retrieve data. Please check the city name and try again.");
    }
}

async function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;

            try {
                await fetchWeatherData(weatherUrl);

                await fetchForecastData(forecastUrl);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Failed to retrieve data for your location.");
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to access location. Please allow location permissions.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.main) {
            displayCurrentWeather(data);
        } else {
            console.error("Incomplete data received:", data);
            alert("Failed to retrieve current weather data.");
        }
    } catch (error) {
        console.error("Error fetching current weather data:", error);
        alert(`Failed to retrieve current weather data. Error: ${error.message}`);
    }
}
async function autocompleteCity() {
    const input = document.getElementById('city-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const query = input.value.trim();
    
    autocompleteList.innerHTML = '';
    
    if (query.length < 3) return; 

    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`);
        const cities = await response.json();

        cities.forEach(city => {
            const item = document.createElement('div');
            item.textContent = `${city.name}, ${city.country}`;
            item.addEventListener('click', () => {
                input.value = city.name; 
                autocompleteList.innerHTML = '';
                getWeatherByCity();
            });
            autocompleteList.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching autocomplete data:", error);
    }
}

async function fetchForecastData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Sttus: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.list) {
            displayForecast(data);
        } else {
            console.error("Incomplete data received:", data);
            alert("Failed to retrieve forecast data.");
        }
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        alert(`Failed to retrieve forecast data. Error: ${error.message}`);
    }
}

function displayCurrentWeather(data) {
    const weatherDiv = document.getElementById('current-weather');
    const { main, weather, wind } = data;
    weatherDiv.innerHTML = `
    <div class="current-weather-content">
        <h2 class="city-name">${data.name}</h2>
        <p class="temperature">${main.temp.toFixed(1)}° ${isCelsius ? 'C' : 'F'}</p>
        <p class="weather-description">${weather[0].description}</p>
        <div class="additional-info">
            <p class="humidity">Humidity: ${main.humidity}%</p>
            <p class="wind-speed">Wind: ${wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
        </div>
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
    </div>
`;

}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    const forecastList = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    forecastList.slice(0, 5).forEach(day => {
        const { main, weather } = day;
        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
                <p>${main.temp_min.toFixed(1)}° / ${main.temp_max.toFixed(1)}°</p>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
                <p>${weather[0].description}</p>
            </div>
        `;
    });
}


function toggleUnit() {
    isCelsius = !isCelsius;
    
    const unitToggleButton = document.getElementById('unit-toggle-button');
    unitToggleButton.textContent = isCelsius ? '°F' : '°C';
    
    const city = document.getElementById('city-input').value.trim();
    
    if (city) {
        getWeatherByCity();
    } else {
        getWeatherByLocation();
    }
}
