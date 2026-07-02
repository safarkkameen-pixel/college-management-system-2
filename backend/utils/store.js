/**
 * Generic CRUD helpers on top of Postgres (utils/db.js). Every route file
 * uses these instead of writing raw SQL, so the "schema" of each collection
 * is still just whatever object shape you pass to create() - same as the
 * old JSON-file version. The only difference callers need to know about:
 * every function here now returns a Promise, so every call site must
 * `await` it.
 *
 * Note on find()/findOne(): these still take a plain JS predicate function,
 * not a SQL WHERE clause. We fetch all rows for the collection and filter
 * in Node, exactly like the JSON-file version did. For a college-sized
 * dataset (hundreds, not millions, of rows) this is plenty fast, and it
 * means every route file using store.find(collection, item => ...) keeps
 * working completely unchanged.
 */
const { pool } = require('./db');

async function getAll(collectionName) {
  const { rows } = await pool.query(
    'SELECT data FROM records WHERE collection = $1 ORDER BY id ASC',
    [collectionName]
  );
  return rows.map(r => r.data);
}

async function getById(collectionName, id) {
  const { rows } = await pool.query(
    'SELECT data FROM records WHERE collection = $1 AND id = $2',
    [collectionName, Number(id)]
  );
  return rows[0] ? rows[0].data : undefined;
}

async function find(collectionName, predicate) {
  const all = await getAll(collectionName);
  return all.filter(predicate);
}

async function findOne(collectionName, predicate) {
  const all = await getAll(collectionName);
  return all.find(predicate);
}

async function create(collectionName, obj) {
  // Atomically grab the next id for this collection.
  const { rows } = await pool.query(
    `INSERT INTO counters (collection, value) VALUES ($1, 1)
     ON CONFLICT (collection) DO UPDATE SET value = counters.value + 1
     RETURNING value`,
    [collectionName]
  );
  const nextId = rows[0].value;
  const record = { id: nextId, ...obj, createdAt: new Date().toISOString() };

  await pool.query(
    'INSERT INTO records (collection, id, data) VALUES ($1, $2, $3)',
    [collectionName, nextId, JSON.stringify(record)]
  );
  return record;
}

async function update(collectionName, id, fields) {
  const existing = await getById(collectionName, id);
  if (!existing) return null;

  // Never let a partial update accidentally erase a field with `undefined`.
  const cleanFields = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined)
  );
  const updated = { ...existing, ...cleanFields, updatedAt: new Date().toISOString() };

  await pool.query(
    'UPDATE records SET data = $1 WHERE collection = $2 AND id = $3',
    [JSON.stringify(updated), collectionName, Number(id)]
  );
  return updated;
}

async function remove(collectionName, id) {
  const { rowCount } = await pool.query(
    'DELETE FROM records WHERE collection = $1 AND id = $2',
    [collectionName, Number(id)]
  );
  return rowCount > 0;
}

module.exports = { getAll, getById, find, findOne, create, update, remove };
