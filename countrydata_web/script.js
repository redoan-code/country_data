const COUNTRIES_API = 'https://restcountries.com/v3.1/all';
const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // your API key

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const countriesGrid = document.getElementById('countries-grid');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const modalData = document.getElementById('modal-data');
const filterBtn = document.getElementById('filterBtn');
const continentFilter = document.getElementById('continentFilter');
const pagination = document.getElementById('pagination');

let allCountries = [];
let currentPage = 1;
const countriesPerPage = 12;

async function fetchAllCountries() {
  try {
    const response = await fetch(COUNTRIES_API);
    const data = await response.json();
    allCountries = data;
    displayCountries(allCountries);
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
}

async function fetchWeather(city) {
  if (!city) return null;
  try {
    const response = await fetch(`${WEATHER_API}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

function displayCountries(countries) {
  countriesGrid.innerHTML = '';

  const startIndex = (currentPage - 1) * countriesPerPage;
  const endIndex = startIndex + countriesPerPage;
  const currentCountries = countries.slice(startIndex, endIndex);

  currentCountries.forEach(country => {
    const card = document.createElement('div');
    card.className = 'country-card';

    card.innerHTML = `
      <img src="${country.flags?.png || ''}" alt="${country.name?.common || ''} flag" class="country-flag">
      <div class="country-info">
        <div class="country-name">${country.name?.common || 'N/A'}</div>
        <p>Capital: ${country.capital?.[0] || 'N/A'}</p>
        <p>Population: ${country.population?.toLocaleString() || 'N/A'}</p>
        <button class="details-btn">More Details</button>
      </div>
    `;

    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', () => showDetails(country));

    countriesGrid.appendChild(card);
  });

  setupPagination(countries);
}

function setupPagination(countries) {
  pagination.innerHTML = '';

  const totalPages = Math.ceil(countries.length / countriesPerPage);

  const prevBtn = document.createElement('button');
  prevBtn.innerText = '« Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayCountries(countries);
    }
  });
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      displayCountries(countries);
    });
    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.innerText = 'Next »';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayCountries(countries);
    }
  });
  pagination.appendChild(nextBtn);
}

async function showDetails(country) {
  const capital = country.capital?.[0] || '';
  const weatherData = await fetchWeather(capital);

  let weatherHTML = '';
  if (weatherData) {
    weatherHTML = `
      <h3>Weather in ${capital}</h3>
      <p>Temperature: ${weatherData.main.temp} °C</p>
      <p>Weather: ${weatherData.weather[0].description}</p>
      <p>Humidity: ${weatherData.main.humidity}%</p>
    `;
  } else {
    weatherHTML = `<p>Weather information not available</p>`;
  }

  modalData.innerHTML = `
    <h2>${country.name?.common || 'N/A'}</h2>
    <img src="${country.flags?.png || ''}" alt="${country.name?.common || ''}" style="width:200px;">
    <p><strong>Capital:</strong> ${capital || 'N/A'}</p>
    <p><strong>Population:</strong> ${country.population?.toLocaleString() || 'N/A'}</p>
    <p><strong>Region:</strong> ${country.region || 'N/A'}</p>
    <p><strong>Subregion:</strong> ${country.subregion || 'N/A'}</p>
    <p><strong>Area:</strong> ${country.area?.toLocaleString() || 'N/A'} km²</p>
    ${weatherHTML}
  `;

  modal.style.display = 'block';
}

function searchCountries() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = allCountries.filter(country =>
    country.name.common.toLowerCase().includes(term)
  );
  currentPage = 1;
  displayCountries(filtered);
}

function filterCountries() {
  const selectedRegion = continentFilter.value;
  const filtered = selectedRegion === "all"
    ? allCountries
    : allCountries.filter(c => c.region === selectedRegion);
  currentPage = 1;
  displayCountries(filtered);
}

searchBtn.addEventListener('click', searchCountries);
filterBtn.addEventListener('click', filterCountries);
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchCountries();
});
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

window.addEventListener('load', fetchAllCountries);
continentFilter.addEventListener('change', filterCountries);