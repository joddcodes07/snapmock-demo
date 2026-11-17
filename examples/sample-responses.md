# Sample responses

These examples show the response shape from the supplied database. JSON is shortened where noted. Successful writes persist to `db.json`.

## `GET /movies/6` — 200 OK

```json
{
  "id": 6,
  "title": "Inception",
  "genre": "Sci-Fi",
  "language": "English",
  "releaseYear": 2010,
  "rating": 8.8,
  "runtime": 148,
  "director": "Christopher Nolan"
}
```

## `POST /movies` — 201 Created

Posting the Arrival example from `requests.http` omits `id`; SnapMock assigns the next numeric ID. The response is the new record, including that generated `id`.

```json
{
  "id": 19,
  "title": "Arrival",
  "genre": "Sci-Fi",
  "language": "English",
  "releaseYear": 2016,
  "rating": 7.9,
  "runtime": 116,
  "director": "Denis Villeneuve"
}
```

## `GET /movies?genre=Sci-Fi` — 200 OK

Returns a JSON array containing matching movies, including `Inception`, `The Matrix`, and `Interstellar`.

## `GET /movies?_page=1&_limit=5` — 200 OK

Returns the first five entries as a JSON array. Pagination metadata is in headers: `x-total-count`, `x-page`, `x-limit`, and `x-total-pages`.

## `DELETE /movies/18` — 204 No Content

The response has no body.

## Simulated errors

When started with `--scenario unauthorized`, requests receive `401 Unauthorized` with `{"error":"Unauthorized scenario response."}`. With `--scenario serverError`, requests receive `500 Internal Server Error` with `{"error":"Simulated server error."}`.
