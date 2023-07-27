// Global variables
let map;
let weatherData;
const weatherApiUrl = 'http://api.weatherapi.com/v1/current.json';
const forecastApiUrl = 'http://api.weatherapi.com/v1/forecast.json';
const weatherApiKey = '38ce19499a5d4262b7b142751232707';

// Function to initialize the map
function initMap(latitude, longitude) {
    map = L.map('mapContainer').setView([latitude, longitude], 13);
  
    // Add OpenStreetMap tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // Create a custom marker icon with the GIF image and radiation circles
    const customIcon = L.divIcon({
      className: 'custom-icon',
      html: `<div class="gif-icon"></div>`
    });
  
    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    marker.bindPopup('Your Location').openPopup();
  
    // Fetch weather data and display statistics
    fetchWeatherData(latitude, longitude);
  }

// Function to fetch weather data
async function fetchWeatherData(latitude, longitude) {
  try {
    const response = await fetch(`${weatherApiUrl}?key=${weatherApiKey}&q=${latitude},${longitude}`);
    const data = await response.json();
    weatherData = data;
    displayWeatherStats(data);
    displayTemperatureGraph();
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

// Function to display weather statistics
function displayWeatherStats(weatherData) {
    const weatherStatsContainer = document.getElementById('weatherStats');
    weatherStatsContainer.innerHTML = `
      <h2>Weather Statistics</h2>
      <p>Temperature: ${weatherData.current.temp_c} &#8451;</p>
      <p>Humidity: ${weatherData.current.humidity}%</p>
      <p>Pressure: ${weatherData.current.pressure_mb} hPa</p>
      <p>Precipitation: ${weatherData.current.precip_mm} mm</p>
      <p>Wind Speed: ${weatherData.current.wind_kph} km/h</p>
      <p>Wind Direction: ${weatherData.current.wind_dir}</p>
    `;
  }
  
  // Function to fetch historical temperature data
  async function fetchHistoricalData() {
    const latitude = weatherData.location.lat;
    const longitude = weatherData.location.lon;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
  
    try {
      const response = await fetch(`${forecastApiUrl}?key=${weatherApiKey}&q=${latitude},${longitude}&dt=${startDate.toISOString().slice(0, 10)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return null;
    }
  }
// Function to fetch weather data for the entered location
async function fetchWeatherDataByLocation(location) {
    try {
      const response = await fetch(`${weatherApiUrl}?key=${weatherApiKey}&q=${location}`);
      const data = await response.json();
      weatherData = data;
      displayWeatherStats(data);
      displayTemperatureGraph();
      const { lat, lon } = data.location;
  
      // Create a custom marker icon with the GIF image and radiation circles
      const customIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div class="gif-icon"></div>`
      });
  
      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`Weather in ${location}`).openPopup();
      map.setView([lat, lon], 13);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }
  
  // Event listener for the search button click
  document.getElementById('searchBtn').addEventListener('click', () => {
    const location = document.getElementById('searchInput').value;
    if (location.trim() !== '') {
      fetchWeatherDataByLocation(location);
    }
  });

// Function to display the temperature graph
async function displayTemperatureGraph() {
  const historicalData = await fetchHistoricalData();
  if (!historicalData) return;

  const dates = [];
  const temperatures = [];

  historicalData.forecast.forecastday.forEach(day => {
    dates.push(day.date);
    temperatures.push(day.day.avgtemp_c);
  });

  const ctx = document.getElementById('temperatureChart').getContext('2d');
  const temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: 90
          }
        }
      }
    }
  });
}

// Function to request user location access and initialize the map
function getLocationAndInitMap() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        initMap(latitude, longitude);
      },
      error => {
        console.error('Error getting location:', error);
      }
    );
  } else {
    console.error('Geolocation is not available in this browser.');
  }
}

// Call getLocationAndInitMap on page load
getLocationAndInitMap();
