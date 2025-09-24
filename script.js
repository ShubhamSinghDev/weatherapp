// API Configuration - Using your specific details
const API_KEY = '07ed293e85e0a87452217748b550c7bd';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const currentWeather = document.getElementById('currentWeather');
const extendedForecast = document.getElementById('extendedForecast');
const loadingSpinner = document.getElementById('loadingSpinner');
const recentCitiesDropdown = document.getElementById('recentCities');
const unitToggle = document.getElementById('unitToggle');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeErrorModal = document.getElementById('closeErrorModal');
const confirmError = document.getElementById('confirmError');
const weatherAlert = document.getElementById('weatherAlert');
const alertMessage = document.getElementById('alertMessage');
const closeAlert = document.getElementById('closeAlert');

// Application State
let isCelsius = true;
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
let currentWeatherData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Weather App Initialized');
    
    // Set up event listeners
    setupEventListeners();
    updateRecentCitiesDropdown();
    
    // Load default city or recent city
    const defaultCity = recentCities.length > 0 ? recentCities[0] : 'London';
    fetchWeatherData(defaultCity);
});

// Set up all event listeners
function setupEventListeners() {
    // Search button
    searchBtn.addEventListener('click', handleCitySearch);
    
    // Enter key in search input
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleCitySearch();
        }
    });
    
    // Current location button
    currentLocationBtn.addEventListener('click', getCurrentLocationWeather);
    
    // Temperature unit toggle
    unitToggle.addEventListener('click', toggleTemperatureUnit);
    
    // Recent cities dropdown
    cityInput.addEventListener('focus', showRecentCities);
    cityInput.addEventListener('blur', function() {
        setTimeout(() => {
            recentCitiesDropdown.classList.add('hidden');
        }, 200);
    });
    
    // Error modal
    closeErrorModal.addEventListener('click', hideErrorModal);
    confirmError.addEventListener('click', hideErrorModal);
    
    // Weather alert
    closeAlert.addEventListener('click', function() {
        weatherAlert.classList.add('hidden');
    });
    
    console.log('All event listeners set up successfully');
}

// Handle city search
function handleCitySearch() {
    const cityName = cityInput.value.trim();
    
    if (!cityName) {
        showError('Please enter a city name');
        return;
    }
    
    fetchWeatherData(cityName);
}

// Get weather for current location
function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoadingState();
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        error => {
            hideLoadingState();
            showError('Unable to retrieve your location. Please check location permissions.');
        }
    );
}

// Fetch weather data by city name
async function fetchWeatherData(cityName) {
    showLoadingState();
    
    try {
        console.log(`Fetching weather for: ${cityName}`);
        
        // Build API URL with your specific endpoint
        const apiUrl = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
            // API key is invalid - use mock data
            console.log('API key invalid, using mock data');
            displayMockData(cityName);
            showWeatherAlert('Using demonstration data. Please check your API key for real weather data.');
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        // Display the real weather data
        displayCurrentWeather(data);
        
        // Since we only have current weather endpoint, generate mock forecast
        generateMockForecast(data);
        
        addToRecentCities(cityName);
        updateBackground(data.weather[0].main);
        checkExtremeTemperature(data.main.temp);
        
    } catch (error) {
        console.error('Fetch error:', error);
        
        // Fallback to mock data on any error
        displayMockData(cityName);
        showWeatherAlert('Using demonstration data due to: ' + error.message);
        
    } finally {
        hideLoadingState();
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    showLoadingState();
    
    try {
        const apiUrl = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(apiUrl);
        
        if (response.status === 401) {
            // Use mock data for current location
            displayMockData('Your Location');
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        displayCurrentWeather(data);
        generateMockForecast(data);
        addToRecentCities(data.name);
        updateBackground(data.weather[0].main);
        checkExtremeTemperature(data.main.temp);
        
    } catch (error) {
        console.error('Coordinate fetch error:', error);
        displayMockData('Your Location');
    } finally {
        hideLoadingState();
    }
}

// Display current weather data
function displayCurrentWeather(data) {
    currentWeatherData = data;
    
    const cityName = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6);
    const pressure = data.main.pressure;
    const visibility = (data.visibility / 1000).toFixed(1);
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const weatherDesc = data.weather[0].description;
    const weatherIcon = data.weather[0].icon;
    
    // Update DOM elements
    document.getElementById('currentCity').textContent = `${cityName}, ${country}`;
    document.getElementById('currentTemp').textContent = `${temp}°C`;
    document.getElementById('weatherDesc').textContent = weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);
    document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${windSpeed} km/h`;
    document.getElementById('pressure').textContent = `${pressure} hPa`;
    document.getElementById('visibility').textContent = `${visibility} km`;
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    
    updateWeatherIcon(weatherIcon);
    currentWeather.classList.remove('hidden');
}

// Generate mock forecast data based on current weather
