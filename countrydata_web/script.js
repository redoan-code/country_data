
const COUNTRIES_API = 'https://restcountries.com/v3.1';
const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // OpenWeatherMap API key

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const countriesGrid = document.getElementById('countries-grid');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');

async function fetchCountries(searchTerm = '') {
  try {
    const response = await fetch(`${COUNTRIES_API}/name/${searchTerm}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

async function fetchWeather(city) {
  try {
    const response = await fetch(
      `${WEATHER_API}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

function displayCountries(countries) {
  countriesGrid.innerHTML = '';
  
  countries.forEach(country => {
    const card = document.createElement('div');
    card.className = 'country-card';
    
    card.innerHTML = `
      <img src="${country.flags.png}" alt="${country.name.common} flag" class="country-flag">
      <div class="country-info">
        <div class="country-name">${country.name.common}</div>
        <p>Capital: ${country.capital?.[0] || 'N/A'}</p>
        <p>Population: ${country.population.toLocaleString()}</p>
        <button class="details-btn" data-country='${JSON.stringify(country)}'>More Details</button>
      </div>
    `;
    
    countriesGrid.appendChild(card);
  });
}

async function showDetails(countryData) {
  const weatherData = await fetchWeather(countryData.capital?.[0]);
  
  const modalData = document.getElementById('modal-data');
  modalData.innerHTML = `
    <h2>${countryData.name.common}</h2>
    <img src="${countryData.flags.png}" alt="${countryData.name.common} flag" style="width: 200px;">
    <p><strong>Official Name:</strong> ${countryData.name.official}</p>
    <p><strong>Capital:</strong> ${countryData.capital?.[0] || 'N/A'}</p>
    <p><strong>Population:</strong> ${countryData.population.toLocaleString()}</p>
    <p><strong>Region:</strong> ${countryData.region}</p>
    <p><strong>Subregion:</strong> ${countryData.subregion || 'N/A'}</p>
    <p><strong>Languages:</strong> ${Object.values(countryData.languages || {}).join(', ')}</p>
    <p><strong>Currencies:</strong> ${Object.values(countryData.currencies || {}).map(curr => `${curr.name} (${curr.symbol})`).join(', ')}</p>
    <p><strong>Area:</strong> ${countryData.area.toLocaleString()} km²</p>
    
    ${weatherData ? `
      <div class="weather-info">
        <h3>Weather in ${countryData.capital?.[0]}</h3>
        <p>Temperature: ${weatherData.main.temp}°C</p>
        <p>Weather: ${weatherData.weather[0].description}</p>
        <p>Humidity: ${weatherData.main.humidity}%</p>
      </div>
    ` : ''}
  `;
  
  modal.style.display = 'block';
}

async function performSearch() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    try {
      const countries = await fetchCountries(searchTerm);
      if (countries && countries.length > 0) {
        displayCountries(countries);
      } else {
        countriesGrid.innerHTML = '<p>No countries found. Try another search term.</p>';
      }
    } catch (error) {
      countriesGrid.innerHTML = '<p>Error searching for countries. Please try again.</p>';
    }
  } else {
    loadIndianSubcontinentCountries();
  }
}

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Load Indian subcontinent countries
const INDIAN_SUBCONTINENT = ['india', 'pakistan', 'bangladesh', 'nepal', 'bhutan', 'sri lanka', 'maldives'];

async function loadIndianSubcontinentCountries() {
  const allCountries = [];
  for (const country of INDIAN_SUBCONTINENT) {
    const data = await fetchCountries(country);
    if (data && data.length > 0) {
      allCountries.push(data[0]);
    }
  }
  displayCountries(allCountries);
}

// Add click event listener for details buttons
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('details-btn')) {
    const countryData = JSON.parse(e.target.dataset.country);
    await showDetails(countryData);
  }
});

window.addEventListener('load', loadIndianSubcontinentCountries);
