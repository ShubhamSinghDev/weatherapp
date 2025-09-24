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
