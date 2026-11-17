# SnapMock movie API demo

A small, separate demo repository showing how a frontend developer can get a movie REST API from a JSON file, without writing a server or Express routes.

> **This repository is the demo project.** It installs and runs the published [`snapmock@1.0.0`](https://www.npmjs.com/package/snapmock) package as a dependency. It does not contain SnapMock's implementation and is not the SnapMock package repository.

## What is SnapMock?

[SnapMock](https://github.com/joddcodes07/snapmock) is a configuration driven mock REST API server. Point its CLI at a JSON database and it exposes collection and record endpoints, persists successful writes, and supports query filtering, search, pagination, delays, and scenarios.

Links: [SnapMock source repository](https://github.com/joddcodes07/snapmock) · [Published npm package](https://www.npmjs.com/package/snapmock) · [SnapMock demo repository](https://github.com/joddcodes07/snapmock-demo)

## Prerequisites

- Node.js 18 or newer
- npm

## Install and start

Clone this demo repository, then from its directory run:

```sh
npm install
npm start
```

`npm install` installs the registry release `snapmock@1.0.0` (pinned in `package.json` and `package-lock.json`). The server uses `db.json` and listens at `http://127.0.0.1:3000`.

Open `http://127.0.0.1:3000/movies` in a browser, use `curl`, or open [`examples/requests.http`](examples/requests.http) in an HTTP client. To stop the server, press Ctrl+C.

## Endpoints

SnapMock creates these endpoints for the `movies` array in `db.json`:

| Method | URL | Purpose | Typical status |
| --- | --- | --- | --- |
| `GET` | `/movies` | List movies | `200` |
| `GET` | `/movies/:id` | Read one movie | `200`, `404` if missing |
| `POST` | `/movies` | Add a movie | `201`; `400` for a duplicate ID |
| `PUT` | `/movies/:id` | Replace a movie | `200`, `404` if missing |
| `PATCH` | `/movies/:id` | Change selected fields | `200`, `404` if missing |
| `DELETE` | `/movies/:id` | Remove a movie | `204`, `404` if missing |

Successful mutations are written back to the local `db.json`. Use a copy or restore the file from Git if you want to discard manual changes.

## Requests and responses

### Get the collection and an individual movie

```sh
curl http://127.0.0.1:3000/movies
curl http://127.0.0.1:3000/movies/6
```

`GET /movies/6` returns `200 OK`:

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

### Create, replace, patch, and delete

Create a record without an ID; SnapMock assigns the next numeric ID and returns `201 Created` with the record:

```sh
curl -X POST http://127.0.0.1:3000/movies \
  -H 'content-type: application/json' \
  -d '{"title":"Arrival","genre":"Sci-Fi","language":"English","releaseYear":2016,"rating":7.9,"runtime":116,"director":"Denis Villeneuve"}'
```

Replace an existing record with `PUT` (`200 OK`):

```sh
curl -X PUT http://127.0.0.1:3000/movies/6 \
  -H 'content-type: application/json' \
  -d '{"title":"Inception: The Dream Heist","genre":"Sci-Fi","language":"English","releaseYear":2010,"rating":8.8,"runtime":148,"director":"Christopher Nolan"}'
```

Change only selected fields with `PATCH` (`200 OK`):

```sh
curl -X PATCH http://127.0.0.1:3000/movies/6 \
  -H 'content-type: application/json' \
  -d '{"rating":8.9,"runtime":149}'
```

Delete a record (`204 No Content`, empty response body):

```sh
curl -i -X DELETE http://127.0.0.1:3000/movies/18
```

These examples write to `db.json`. Restore the fixture with `git checkout -- db.json` if you want the original sample data back.

## Filtering, search, and pagination

Collection query options are passed in the URL:

```sh
curl 'http://127.0.0.1:3000/movies?genre=Sci-Fi'
curl 'http://127.0.0.1:3000/movies?language=Japanese'
curl 'http://127.0.0.1:3000/movies?q=interstellar'
curl -i 'http://127.0.0.1:3000/movies?_page=1&_limit=5'
```

Filtering matches a field such as `genre` or `language`; `q` searches the records. Pagination uses `_page` and `_limit`, returns a JSON array, and adds `x-total-count`, `x-page`, `x-limit`, and `x-total-pages` headers.

## Response delay and scenario simulation

The CLI supports response delay, random error rate, and named scenarios. Stop the normal server with Ctrl+C before starting one of these modes:

```sh
npm run start:slow
npm run start:unauthorized
npm run start:server-error
```

The slow script starts with `--delay 750`, so successful responses wait 750 ms. The unauthorized scenario returns `401`; the server error scenario returns `500`. You can also run the installed CLI directly:

```sh
./node_modules/.bin/snapmock --db ./db.json --port 3000 --error-rate 25
./node_modules/.bin/snapmock --db ./db.json --port 3000 --scenario slowNetwork
```

`--error-rate` takes a percentage from 0 to 100. `slowNetwork` adds one second of latency. Scenario scripts operate against the same fixture; error-only modes do not mutate it unless a request reaches the normal mutation handling.

## Automated API demo

Start the normal server in one terminal:

```sh
npm start
```

In a second terminal, run:

```sh
npm run test:api
```

The built-in Node.js `fetch` checks collection and record GET, POST, PUT, PATCH, DELETE, genre filtering, `q` search, and pagination. It adds one temporary movie, then deletes it, and restores movie `1` after the update checks. Do not run the demo checks against a database you need to preserve. You can point the script to another server with `SNAPMOCK_URL=http://127.0.0.1:3001 npm run test:api`.

## Project structure

```text
snapmock-demo/
├── db.json
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── examples/
│   ├── requests.http
│   └── sample-responses.md
└── scripts/
    └── test-api.js
```

## License and credits

The demo files are released under the MIT License. SnapMock is separately maintained and published by [joddcodes07](https://github.com/joddcodes07/snapmock); see the [package repository](https://github.com/joddcodes07/snapmock) for its license and implementation.
