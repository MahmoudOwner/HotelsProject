let map, bounds;

const ApiKey = '6510debf85msh59a3d831a8b632cp1c7061jsnec0d78cf459d';


async function initMap() {
  const center = { lat: 31.200092, lng: 29.918739 }
  const zoom = 12
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("mapContainer"), {center,zoom,disableDefaultUI: true})
  bounds = new google.maps.LatLngBounds()
} window.initMap = initMap;

//function to get hotels and Markered it
async function fetchHotels(country) {
  const url = `https://hotels4.p.rapidapi.com/locations/v3/search?q=${country}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': ApiKey,
      'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
    }
  }
  const response = await fetch(url, options);
  const result = await response.json();

  getMarkers(result.sr)
}

//function to get countries data in the input
async function fetchCountries() {
  const urlx = 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=10&offset=40';
  const optionsx = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': ApiKey,
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
    }
  }
  const response = await fetch(urlx, optionsx)
  const result = await response.json()
  return result.data
}

//google Marker in the map and options
function getMarkers(Markers){
  Markers.map((hotel, index) => {
    const lat = parseFloat(hotel.coordinates.lat)
    const lng = parseFloat(hotel.coordinates.long)
    const position = {lat, lng}
    const label = (index + 1).toString()
    new google.maps.Marker({position, label, map})
    bounds.extend(new google.maps.LatLng(position)) 
    map.fitBounds(bounds)
  })
  console.log(bounds)
}

//function to load countries as li
(async function loadCountries() {
  const countries = await fetchCountries()
  const countriesList = document.querySelector(`#countries_list`)
  const countriesInput = document.querySelector(`#countries_input`)

for (let i=0; i < countries.length ;i++) {

  countriesList.innerHTML += `
  <li data-country=${countries[i].name}>${countries[i].name}</li>
  `
}

countriesList.style.display = "none";
countriesInput.addEventListener('click', function() {
  countriesList.style.display = "block";
})

const AllCountries = Array.from(countriesList.children)

AllCountries.map(
  country => {
    country.addEventListener('click', function(e) {
      const selectedCountry = e.target.dataset.country
      countriesInput.value = selectedCountry
      countriesList.style.display = "none"
      fetchHotels(selectedCountry)
    })
  }
)
})()

//to the first input 
const search = document.querySelector('#search');
const suggest_list = document.querySelector('#auto_suggest_list');

search.addEventListener('input', async function(e){

//if condition to handeled first input 
if(e.target.value === '') {
  suggest_list.innerHTML = ''
} else {
  const countries = await fetchCountries()
  const selectedCountries = countries.filter(country => country.name.toLowerCase().startsWith(e.target.value))

  suggest_list.innerHTML = ''

  selectedCountries.map(country => {
    suggest_list.innerHTML += `
        <li data-country=${country.name}>${country.name}</li>
    `
  })

  const filteredCountries = Array.from(suggest_list.children)
  filteredCountries.map((country)=> {
    country.addEventListener('click', function(e) {
      fetchHotels(e.target.dataset.country)
      suggest_list.innerHTML = ''
      search.value = e.target.dataset.country
    })
  })
}

})
