const API_KEY = "7b3cde2f234d1ca72b9d1c13ccbf3b19";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = `${BASE_URL}/search/movie?api_key=${API_KEY}`;

const genres = [
  { "id": 28, "name": "Action" }, { "id": 12, "name": "Adventure" },
  { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" },
  { "id": 80, "name": "Crime" }, { "id": 99, "name": "Documentary" },
  { "id": 18, "name": "Drama" }, { "id": 10751, "name": "Family" },
  { "id": 14, "name": "Fantasy" }, { "id": 36, "name": "History" },
  { "id": 27, "name": "Horror" }, { "id": 10402, "name": "Music" },
  { "id": 9648, "name": "Mystery" }, { "id": 10749, "name": "Romance" },
  { "id": 878, "name": "Science Fiction" }, { "id": 10770, "name": "TV Movie" },
  { "id": 53, "name": "Thriller" }, { "id": 10752, "name": "War" }
];

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');
const viewGenresBtn = document.getElementById('viewGenresBtn');
const genreCatalog = document.getElementById('genreCatalog');
const genreCatalogContent = document.getElementById('genreCatalogContent');
const sortRatingBtn = document.getElementById('sortRatingBtn');

let currentPage = 1;
let totalPages = 100;
let selectedGenre = [];
let lastUrl = API_URL;

sortRatingBtn.addEventListener('click', () => sortMoviesByRating());

// Показ окна жанров
viewGenresBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openGenreCatalog();
});

search.addEventListener('input', () => {
  const searchTerm = search.value.trim();
  if (searchTerm.length > 2) {  // Начинать искать после ввода 3 символов
    fetchSuggestions(searchTerm);
  } else {
    movieSuggestions.innerHTML = ''; // Очищаем автокомплит, если меньше 3 символов
  }
});
function openGenreCatalog() {
  genreCatalogContent.innerHTML = '<h1>Select Genres</h1><div class="genre-grid"></div>';
  const genreGrid = genreCatalogContent.querySelector('.genre-grid');

  genres.forEach(genre => {
    const genreItem = document.createElement('div');
    genreItem.classList.add('genre-item');
    genreItem.id = `genre-${genre.id}`;
    genreItem.innerText = genre.name;

    if (selectedGenre.includes(genre.id)) {
      genreItem.classList.add('highlight');
    }

    genreItem.addEventListener('click', () => toggleGenreSelection(genre.id, genreItem));
    genreGrid.appendChild(genreItem);
  });

  genreCatalog.style.display = 'flex';
}
function fetchSuggestions(query) {
  const url = `${searchURL}&query=${query}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      movieSuggestions.innerHTML = '';  // Очищаем предыдущие предложения
      data.results.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.title;
        movieSuggestions.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching suggestions:', error));
}
function toggleGenreSelection(genreId, genreElement) {
  if (selectedGenre.includes(genreId)) {
    selectedGenre = selectedGenre.filter(id => id !== genreId);
    genreElement.classList.remove('highlight');
  } else {
    selectedGenre.push(genreId);
    genreElement.classList.add('highlight');
  }
  currentPage = 1; // Обнуляем страницу
  fetchMovies();
}

function closeGenreCatalog() {
  genreCatalog.style.display = 'none';
}

// Функция сортировки по рейтингу
function sortMoviesByRating() {
  const movieElements = Array.from(document.querySelectorAll('.movie'));
  movieElements.sort((a, b) => {
    const ratingA = parseFloat(a.querySelector('.movie-info span').innerText);
    const ratingB = parseFloat(b.querySelector('.movie-info span').innerText);
    return ratingB - ratingA;
  });

  main.innerHTML = '';
  movieElements.forEach(movieEl => main.appendChild(movieEl));
}

// Обработка формы поиска
form.addEventListener('submit', (e) => {
  e.preventDefault();
  selectedGenre = [];
  currentPage = 1;
  const searchTerm = search.value;

  if (searchTerm) {
    fetchMovies(searchURL + `&query=${searchTerm}`);
  } else {
    fetchMovies(API_URL);
  }
});

function fetchMovies(url = API_URL) {
  let genresQuery = selectedGenre.length ? `&with_genres=${selectedGenre.join(',')}` : '';
  let urlWithPage = `${url}${genresQuery}&page=${currentPage}`;
  lastUrl = url; // Обновляем lastUrl для пагинации

  fetch(urlWithPage)
    .then(res => res.json())
    .then(data => {
      if (data.results.length) {
        showMovies(data.results);
        currentPage = data.page;
        totalPages = data.total_pages;
        updatePagination();
      } else {
        main.innerHTML = '<h1 class="no-results">No Results Found</h1>';
      }
    })
    .catch(error => console.error('Error fetching movies:', error));
}

function showMovies(data) {
  main.innerHTML = '';
  data.forEach(movie => {
    const { title, poster_path, vote_average, overview } = movie;
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <img src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1580"}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getColor(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview">
        <h3>Overview</h3>
        ${overview}
      </div>
    `;
    main.appendChild(movieEl);
  });
  sortMoviesByRating(); // Вызов сортировки, если нужно отсортировать при каждой загрузке
}

function getColor(vote) {
  return vote >= 8 ? 'green' : vote >= 5 ? 'orange' : 'red';
}

function updatePagination() {
  current.innerText = currentPage;
  prev.classList.toggle('disabled', currentPage === 1);
  next.classList.toggle('disabled', currentPage === totalPages);
}

prev.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies(lastUrl);
  }
});

next.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies(lastUrl);
  }
});

// Initial Fetch
fetchMovies();
