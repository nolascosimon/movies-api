const view = document.getElementById("view");
const notice = document.getElementById("notice");
const fields = ["title", "genre", "director", "release_year", "rating"];
const star =
  '<svg class="star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>';

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function genreClass(genre) {
  const g = genre.toLowerCase();
  if (g.includes("sci")) return "scifi";
  if (g.includes("fantasy")) return "fantasy";
  if (g.includes("action")) return "action";
  if (g.includes("adventure")) return "adventure";
  if (g.includes("comedy")) return "comedy";
  if (g.includes("drama")) return "drama";
  return "other";
}

function showNotice(text, type) {
  notice.textContent = text;
  notice.className = "notice " + type;
}

function clearNotice() {
  notice.textContent = "";
  notice.className = "notice hidden";
}

function showLoading() {
  view.innerHTML = '<p class="state">Loading...</p>';
}

function showNotFound() {
  view.innerHTML =
    '<div class="state"><h2>Movie not found</h2>' +
    "<p>This movie does not exist or was already deleted.</p>" +
    '<button onclick="showList()">Back to list</button></div>';
}

function showServerError() {
  view.innerHTML =
    '<div class="state"><h2>Could not reach the server</h2>' +
    "<p>Make sure the backend is running and try again.</p>" +
    '<button onclick="showList()">Try again</button></div>';
}

async function request(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data: data };
  } catch (error) {
    return { status: 0, data: null };
  }
}

let movies = [];

function cardsHtml(list) {
  if (list.length === 0) {
    return '<p class="state">No movies match your search.</p>';
  }
  let html = '<div class="grid">';
  for (const movie of list) {
    html +=
      '<div class="card">' +
      '<div class="poster ' + genreClass(movie.genre) + '">' +
      '<span class="genre-label">' + esc(movie.genre) + "</span>" +
      '<span class="rating">' + star + movie.rating.toFixed(1) + "</span>" +
      '<span class="year">' + movie.release_year + "</span></div>" +
      '<div class="card-body">' +
      "<h3>" + esc(movie.title) + "</h3>" +
      '<p class="director">Directed by ' + esc(movie.director) + "</p>" +
      '<div class="actions">' +
      '<button onclick="showDetail(' + movie.id + ')">View</button>' +
      '<button onclick="showForm(' + movie.id + ')">Edit</button>' +
      '<button class="danger" onclick="deleteMovie(' + movie.id + ')">Delete</button>' +
      "</div></div></div>";
  }
  html += "</div>";
  return html;
}

function searchMovies() {
  const word = document.getElementById("search").value.trim().toLowerCase();
  const found = [];
  for (const movie of movies) {
    const text = (movie.title + " " + movie.genre + " " + movie.director).toLowerCase();
    if (text.includes(word)) {
      found.push(movie);
    }
  }
  document.getElementById("count").textContent =
    found.length + (found.length === 1 ? " movie" : " movies");
  document.getElementById("results").innerHTML = cardsHtml(found);
}

async function showList() {
  clearNotice();
  showLoading();
  const result = await request("/movies");
  if (result.status !== 200) {
    showServerError();
    return;
  }
  movies = result.data;
  if (movies.length === 0) {
    view.innerHTML = '<p class="state">No movies yet. Add one!</p>';
    return;
  }
  view.innerHTML =
    '<div class="page-head"><h2>All Movies</h2><span id="count"></span></div>' +
    '<input id="search" class="search" type="text" placeholder="Search by title, genre or director" oninput="searchMovies()">' +
    '<div id="results"></div>';
  searchMovies();
}

async function showDetail(id) {
  clearNotice();
  showLoading();
  const result = await request("/movies/" + id);
  if (result.status === 404) {
    showNotFound();
    return;
  }
  if (result.status !== 200) {
    showServerError();
    return;
  }
  const movie = result.data;
  view.innerHTML =
    '<div class="detail">' +
    '<div class="poster big ' + genreClass(movie.genre) + '"><span class="genre-label">' + esc(movie.genre) + "</span></div>" +
    "<div>" +
    "<h2>" + esc(movie.title) + "</h2>" +
    "<p><span>Genre:</span> " + esc(movie.genre) + "</p>" +
    "<p><span>Director:</span> " + esc(movie.director) + "</p>" +
    "<p><span>Release year:</span> " + movie.release_year + "</p>" +
    "<p><span>Rating:</span> " + star + movie.rating.toFixed(1) + "</p>" +
    '<div class="actions">' +
    '<button onclick="showList()">Back</button>' +
    '<button onclick="showForm(' + movie.id + ')">Edit</button>' +
    '<button class="danger" onclick="deleteMovie(' + movie.id + ')">Delete</button>' +
    "</div></div></div>";
}

async function showForm(id) {
  clearNotice();
  let movie = { title: "", genre: "", director: "", release_year: "", rating: "" };
  if (id) {
    showLoading();
    const result = await request("/movies/" + id);
    if (result.status === 404) {
      showNotFound();
      return;
    }
    if (result.status !== 200) {
      showServerError();
      return;
    }
    movie = result.data;
  }
  view.innerHTML =
    "<h2>" + (id ? "Edit Movie" : "Add Movie") + "</h2>" +
    '<form novalidate onsubmit="saveMovie(event, ' + (id ? id : "null") + ')">' +
    '<label>Title<input name="title" type="text" value="' + esc(movie.title) + '"></label>' +
    '<label>Genre<input name="genre" type="text" value="' + esc(movie.genre) + '"></label>' +
    '<label>Director<input name="director" type="text" value="' + esc(movie.director) + '"></label>' +
    '<div class="row">' +
    '<label>Release year<input name="release_year" type="number" value="' + movie.release_year + '"></label>' +
    '<label>Rating<input name="rating" type="number" step="0.1" value="' + movie.rating + '"></label>' +
    "</div>" +
    '<div class="actions">' +
    '<button type="submit" class="primary">Save</button>' +
    '<button type="button" onclick="showList()">Cancel</button>' +
    "</div></form>";
}

async function saveMovie(event, id) {
  event.preventDefault();
  const form = event.target;
  const movie = {};
  for (const field of fields) {
    movie[field] = form.elements[field].value.trim();
  }
  if (movie.release_year !== "") {
    movie.release_year = Number(movie.release_year);
  }
  if (movie.rating !== "") {
    movie.rating = Number(movie.rating);
  }
  const url = id ? "/movies/" + id : "/movies";
  const method = id ? "PUT" : "POST";
  const result = await request(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  if (result.status === 400) {
    showNotice(result.data.error, "error");
    return;
  }
  if (result.status === 404) {
    showNotFound();
    return;
  }
  if (result.status !== 200 && result.status !== 201) {
    showServerError();
    return;
  }
  await showList();
  showNotice(id ? "Movie updated" : "Movie added", "success");
}

async function deleteMovie(id) {
  if (!confirm("Delete this movie?")) {
    return;
  }
  const result = await request("/movies/" + id, { method: "DELETE" });
  if (result.status === 200) {
    await showList();
    showNotice("Movie deleted", "success");
  } else if (result.status === 404) {
    await showList();
    showNotice(result.data.error, "error");
  } else {
    showServerError();
  }
}

showList();
