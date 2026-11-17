const assert = require('node:assert/strict');

const baseUrl = process.env.SNAPMOCK_URL ?? 'http://127.0.0.1:3000';
const originalId = 1;
const originalMovie = {
  id: originalId,
  title: 'The Shawshank Redemption',
  genre: 'Drama',
  language: 'English',
  releaseYear: 1994,
  rating: 9.3,
  runtime: 142,
  director: 'Frank Darabont',
};

async function request(path, options) {
  return fetch(new URL(path, baseUrl), options);
}

async function readJson(response) {
  return response.status === 204 ? null : response.json();
}

async function main() {
  let createdId;
  const check = async (name, action) => {
    await action();
    console.log(`✓ ${name}`);
  };

  try {
    await check('GET movie collection', async () => {
      const response = await request('/movies');
      assert.equal(response.status, 200);
      const movies = await readJson(response);
      assert.ok(Array.isArray(movies));
      assert.ok(movies.length >= 15);
    });

    await check('GET one movie by ID', async () => {
      const response = await request(`/movies/${originalId}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await readJson(response), originalMovie);
    });

    await check('POST a movie (201 and generated ID)', async () => {
      const response = await request('/movies', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'SnapMock Test Movie',
          genre: 'Test',
          language: 'English',
          releaseYear: 2026,
          rating: 7,
          runtime: 100,
          director: 'Demo Test',
        }),
      });
      assert.equal(response.status, 201);
      const created = await readJson(response);
      assert.equal(created.title, 'SnapMock Test Movie');
      assert.ok(created.id !== undefined);
      createdId = created.id;
    });

    await check('PUT replace an existing movie', async () => {
      const replacement = { ...originalMovie, title: 'Temporary PUT title' };
      const response = await request(`/movies/${originalId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(replacement),
      });
      assert.equal(response.status, 200);
      assert.equal((await readJson(response)).title, replacement.title);
    });

    await check('PATCH selected fields', async () => {
      const response = await request(`/movies/${originalId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rating: 9.1 }),
      });
      assert.equal(response.status, 200);
      const updated = await readJson(response);
      assert.equal(updated.rating, 9.1);
      assert.equal(updated.title, 'Temporary PUT title');
    });

    await check('filter by genre', async () => {
      const response = await request('/movies?genre=Sci-Fi');
      assert.equal(response.status, 200);
      const movies = await readJson(response);
      assert.ok(movies.length > 0);
      assert.ok(movies.every((movie) => movie.genre === 'Sci-Fi'));
    });

    await check('filter by language', async () => {
      const response = await request('/movies?language=Japanese');
      assert.equal(response.status, 200);
      const movies = await readJson(response);
      assert.ok(movies.length > 0);
      assert.ok(movies.every((movie) => movie.language === 'Japanese'));
    });

    await check('search with q', async () => {
      const response = await request('/movies?q=interstellar');
      assert.equal(response.status, 200);
      const movies = await readJson(response);
      assert.ok(movies.some((movie) => movie.title === 'Interstellar'));
    });

    await check('paginate with _page and _limit', async () => {
      const response = await request('/movies?_page=1&_limit=5');
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('x-page'), '1');
      assert.equal(response.headers.get('x-limit'), '5');
      const movies = await readJson(response);
      assert.equal(movies.length, 5);
    });

    await check('DELETE the created test movie (204)', async () => {
      const response = await request(`/movies/${createdId}`, { method: 'DELETE' });
      assert.equal(response.status, 204);
      createdId = undefined;
    });
  } finally {
    // Leave the supplied fixture as it was, even if an assertion fails midway.
    if (createdId !== undefined) {
      await request(`/movies/${createdId}`, { method: 'DELETE' }).catch(() => {});
    }
    await request(`/movies/${originalId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(originalMovie),
    }).catch(() => {});
  }

  console.log('\nAll API checks passed. The fixture record was restored.');
}

main().catch((error) => {
  console.error('\nAPI checks failed:', error.message);
  console.error('Confirm the mock server is running, then retry npm run test:api.');
  process.exitCode = 1;
});
