# Movies API

A small REST API for movies, made with Flask and SQLite. It supports GET, POST, PUT and DELETE. The first time the server runs, it creates a database with 15 movies.

## How to run it

1. Install Python 3.
2. Install Flask:

```
py -m pip install -r requirements.txt
```

3. Start the server:

```
py app.py
```

The server runs at http://127.0.0.1:5000

To test it, open a second terminal and use the curl commands below. The commands are written for Windows Command Prompt.

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
