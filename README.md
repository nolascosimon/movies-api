# Movies API

A small REST API for movies, made with Flask and SQLite. It supports GET, POST, PUT and DELETE. The first time the server runs, it creates a database with 15 movies.

## Live URL

https://movies-api-1icz.onrender.com/movies

Test it with curl:

curl -i https://movies-api-1icz.onrender.com/movies

The server is on Render's free plan. It goes to sleep when idle, so the first request can take up to a minute. Movies added with POST are not kept after a restart, but the 15 starting movies always come back.

## How to run it

The backend and the frontend run together. Flask serves the files in the `frontend` folder, so there is nothing else to install or start.

1. Install Python 3.
2. Install the requirements:

```
py -m pip install -r requirements.txt
```

3. Start the server:

```
py app.py
```

4. Open http://127.0.0.1:5000 in your browser to use the frontend.

The API is still available at http://127.0.0.1:5000/movies

## Frontend

The frontend is in the `frontend` folder and is made with plain HTML, CSS and JavaScript using the Fetch API.

| File | What it does |
|---|---|
| frontend/index.html | The page layout |
| frontend/style.css | The styling |
| frontend/script.js | The fetch calls and the screens |

What you can do in the app:

| Action | How | API call |
|---|---|---|
| See all movies | Opens on the home page | GET /movies |
| Search movies | Type in the search box on the home page | Filters the list already loaded from GET /movies |
| See one movie | Click View on a movie | GET /movies/:id |
| Add a movie | Click Add Movie and Save | POST /movies |
| Edit a movie | Click Edit and Save | PUT /movies/:id |
| Delete a movie | Click Delete and confirm | DELETE /movies/:id |

The app shows a Loading message while data is being fetched, shows the error message from the API when it returns a 400, and shows a Movie not found screen when it returns a 404.

### About CORS

Browsers block a page from calling an API on a different origin, and a different port counts as a different origin. To avoid this, Flask serves the frontend files itself, so the page and the API share the same origin (http://127.0.0.1:5000) and the browser allows the calls.

## Movie fields

| Field | Type | Required |
|---|---|---|
| id | integer | no, it is added automatically |
| title | text | yes |
| genre | text | yes |
| director | text | yes |
| release_year | whole number | yes |
| rating | number | yes |

## Status codes

| Code | Meaning |
|---|---|
| 200 | The request worked (read, update or delete) |
| 201 | A new movie was created |
| 400 | A field is missing or has the wrong type |
| 404 | The movie was not found |

## Endpoints

### GET /movies

Returns the full list of movies.

Request:

```
curl -i http://127.0.0.1:5000/movies
```

Response (200 OK, shortened):

```
[
  {
    "director": "Ben Stiller",
    "genre": "Adventure Comedy",
    "id": 1,
    "rating": 9.0,
    "release_year": 2013,
    "title": "The Secret Life of Walter Mitty"
  }
]
```

### GET /movies/:id

Returns one movie.

Request:

```
curl -i http://127.0.0.1:5000/movies/1
```

Response (200 OK):

```
{
  "director": "Ben Stiller",
  "genre": "Adventure Comedy",
  "id": 1,
  "rating": 9.0,
  "release_year": 2013,
  "title": "The Secret Life of Walter Mitty"
}
```

Response if the id does not exist (404 NOT FOUND):

```
{
  "error": "Movie not found"
}
```

### POST /movies

Adds a new movie. All fields are required.

Request:

```
curl -i -X POST http://127.0.0.1:5000/movies -H "Content-Type: application/json" -d "{\"title\":\"Spider-Man\",\"genre\":\"Action\",\"director\":\"Sam Raimi\",\"release_year\":2002,\"rating\":8.5}"
```

Response (201 CREATED):

```
{
  "director": "Sam Raimi",
  "genre": "Action",
  "id": 17,
  "rating": 8.5,
  "release_year": 2002,
  "title": "Spider-Man"
}
```

Request with missing fields:

```
curl -i -X POST http://127.0.0.1:5000/movies -H "Content-Type: application/json" -d "{\"title\":\"Spider-Man\"}"
```

Response (400 BAD REQUEST):

```
{
  "error": "Please include the genre"
}
```

### PUT /movies/:id

Updates an existing movie. All fields are required.

Request:

```
curl -i -X PUT http://127.0.0.1:5000/movies/17 -H "Content-Type: application/json" -d "{\"title\":\"Spider-Man\",\"genre\":\"Superhero Action\",\"director\":\"Sam Raimi\",\"release_year\":2002,\"rating\":9.0}"
```

Response (200 OK):

```
{
  "director": "Sam Raimi",
  "genre": "Superhero Action",
  "id": 17,
  "rating": 9.0,
  "release_year": 2002,
  "title": "Spider-Man"
}
```

Response if a field is missing (400 BAD REQUEST):

```
{
  "error": "Please include the genre"
}
```

Response if the id does not exist (404 NOT FOUND):

```
{
  "error": "Movie not found"
}
```

### DELETE /movies/:id

Deletes a movie.

Request:

```
curl -i -X DELETE http://127.0.0.1:5000/movies/17
```

Response (200 OK):

```
{
  "message": "Movie deleted"
}
```

Response if the id does not exist (404 NOT FOUND):

```
{
  "error": "Movie not found"
}
```
