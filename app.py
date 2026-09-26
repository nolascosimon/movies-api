import sqlite3
from flask import Flask, jsonify, request

app = Flask(__name__)
DB_FILE = "movies.db"

REQUIRED_FIELDS = ["title", "genre", "director", "release_year", "rating"]

def get_connection():
    db = sqlite3.connect(DB_FILE)
    db.row_factory = sqlite3.Row
    return db

def make_mov(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "genre": row["genre"],
        "director": row["director"],
        "release_year": row["release_year"],
        "rating": row["rating"],
    }

def setup_db():
    db = get_connection()
    db.execute(
        "CREATE TABLE IF NOT EXISTS movies ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, "
        "title TEXT NOT NULL, "
        "genre TEXT NOT NULL, "
        "director TEXT NOT NULL, "
        "release_year INTEGER NOT NULL, "
        "rating REAL NOT NULL)"
    )
    count = db.execute("SELECT COUNT(*) FROM movies").fetchone()[0]
    if count == 0:
        movies = [
            ("The Secret Life of Walter Mitty", "Adventure Comedy", "Ben Stiller", 2013, 9.0),
            ("The Perks of Being a Wallflower", "Drama", "Stephen Chbosky", 2012, 10.0),
            ("The Hangover", "Comedy", "Todd Phillips", 2009, 9.0),
            ("The Odyssey", "Epic Fantasy", "Christopher Nolan", 2026, 9.5),
            ("Inception", "Sci-Fi", "Christopher Nolan", 2010, 8.0),
            ("Interstellar", "Sci-Fi", "Christopher Nolan", 2014, 9.0),
            ("The Dark Knight", "Action", "Christopher Nolan", 2008, 9.0),
            ("Good Will Hunting", "Drama", "Gus Van Sant", 1997, 9.0),
            ("Forrest Gump", "Drama", "Robert Zemeckis", 1994, 9.0),
            ("Superbad", "Comedy", "Greg Mottola", 2007, 8.5),
            ("Dead Poets Society", "Drama", "Peter Weir", 1989, 10),
            ("Yes Man", "Comedy", "Peyton Reed", 2008, 7.5),
            ("Into the Wild", "Adventure Drama", "Sean Penn", 2007, 9.5),
            ("Ferris Bueller's Day Off", "Comedy", "John Hughes", 1986, 8.0),
            ("Whiplash", "Drama", "Damien Chazelle", 2014, 9.5),
        ]
        db.executemany(
            "INSERT INTO movies (title, genre, director, release_year, rating) "
            "VALUES (?, ?, ?, ?, ?)",
            movies,
        )
        db.commit()
    db.close()

def check_mov_data(data):
    if data is None:
        return "Request body must be valid JSON"
    for field in REQUIRED_FIELDS:
        if field not in data or data[field] == "" or data[field] is None:
            return "Please include the " + field
    if not isinstance(data["release_year"], int):
        return "release_year must be a whole number"
    if not isinstance(data["rating"], (int, float)):
        return "rating must be a number"
    return None

@app.route("/movies", methods=["GET"])
def get_movies():
    db = get_connection()
    rows = db.execute("SELECT * FROM movies").fetchall()
    db.close()
    movies = []
    for row in rows:
        movies.append(make_mov(row))
    return jsonify(movies), 200

@app.route("/movies/<int:movie_id>", methods=["GET"])
def get_movie(movie_id):
    db = get_connection()
    row = db.execute("SELECT * FROM movies WHERE id = ?", (movie_id,)).fetchone()
    db.close()
    if row is None:
        return jsonify({"error": "Movie not found"}), 404
    return jsonify(make_mov(row)), 200

@app.route("/movies", methods=["POST"])
def create_movie():
    data = request.get_json(silent=True)
    error = check_mov_data(data)
    if error:
        return jsonify({"error": error}), 400
    db = get_connection()
    cursor = db.execute(
        "INSERT INTO movies (title, genre, director, release_year, rating) "
        "VALUES (?, ?, ?, ?, ?)",
        (data["title"], data["genre"], data["director"], data["release_year"], data["rating"]),
    )
    db.commit()
    new_id = cursor.lastrowid
    row = db.execute("SELECT * FROM movies WHERE id = ?", (new_id,)).fetchone()
    db.close()
    return jsonify(make_mov(row)), 201


@app.route("/movies/<int:movie_id>", methods=["PUT"])
def update_movie(movie_id):
    db = get_connection()
    row = db.execute("SELECT * FROM movies WHERE id = ?", (movie_id,)).fetchone()
    if row is None:
        db.close()
        return jsonify({"error": "Movie not found"}), 404
    data = request.get_json(silent=True)
    error = check_mov_data(data)
    if error:
        db.close()
        return jsonify({"error": error}), 400
    db.execute(
        "UPDATE movies SET title = ?, genre = ?, director = ?, release_year = ?, rating = ? "
        "WHERE id = ?",
        (data["title"], data["genre"], data["director"], data["release_year"], data["rating"], movie_id),
    )
    db.commit()
    row = db.execute("SELECT * FROM movies WHERE id = ?", (movie_id,)).fetchone()
    db.close()
    return jsonify(make_mov(row)), 200


@app.route("/movies/<int:movie_id>", methods=["DELETE"])
def delete_movie(movie_id):
    db = get_connection()
    row = db.execute("SELECT * FROM movies WHERE id = ?", (movie_id,)).fetchone()
    if row is None:
        db.close()
        return jsonify({"error": "Movie not found"}), 404
    db.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    db.commit()
    db.close()
    return jsonify({"message": "Movie deleted"}), 200

@app.route("/")
def home():
    return jsonify({"message": "Movies API is running. Try /movies"}), 200

setup_db()

if __name__ == "__main__":
    app.run(debug=True)
