process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const fs = require('fs');
const path = require('path');

describe('db helpers', () => {
  let dbModule;

  beforeEach(() => {
    // Clear the module cache before each test so we get a fresh db instance
    jest.resetModules();
    dbModule = require('../db/db');
  });

  test('initDb creates tables and returns a db instance in test mode', async () => {
    const db = await dbModule.initDb();
    expect(db).toBeDefined();
  });

  test('all() returns an empty array when no rows match', async () => {
    await dbModule.initDb();
    const rows = dbModule.all('SELECT * FROM users WHERE id = ?', [9999]);
    expect(rows).toEqual([]);
  });

  test('get() returns undefined when no row matches', async () => {
    await dbModule.initDb();
    const row = dbModule.get('SELECT * FROM users WHERE id = ?', [9999]);
    expect(row).toBeUndefined();
  });

  test('initDb loads from an existing file buffer when NODE_ENV is not test', async () => {
    jest.resetModules();

    // Temporarily switch out of test mode
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const fsMock = require('fs');
    const initSqlJs = require('sql.js');

    // Build a real in-memory DB and export it as a buffer to simulate an existing file
    const SQL = await initSqlJs();
    const tempDb = new SQL.Database();
    tempDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      favoriteClub TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );`);
    const exported = tempDb.export();
    const fileBuffer = Buffer.from(exported);

    // Mock fs so it looks like the DB file already exists on disk
    jest.spyOn(fsMock, 'existsSync').mockReturnValue(true);
    jest.spyOn(fsMock, 'readFileSync').mockReturnValue(fileBuffer);
    jest.spyOn(fsMock, 'mkdirSync').mockImplementation(() => {});
    jest.spyOn(fsMock, 'writeFileSync').mockImplementation(() => {});

    const freshDb = require('../db/db');
    const db = await freshDb.initDb();
    expect(db).toBeDefined();

    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  test('initDb starts fresh when no DB file exists and NODE_ENV is not test', async () => {
    jest.resetModules();

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const fsMock = require('fs');
    jest.spyOn(fsMock, 'existsSync').mockReturnValue(false);
    jest.spyOn(fsMock, 'mkdirSync').mockImplementation(() => {});
    jest.spyOn(fsMock, 'writeFileSync').mockImplementation(() => {});

    const freshDb = require('../db/db');
    const db = await freshDb.initDb();
    expect(db).toBeDefined();

    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  test('saveDb writes to disk when NODE_ENV is not test', async () => {
    jest.resetModules();

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const fsMock = require('fs');
    jest.spyOn(fsMock, 'existsSync').mockReturnValue(false);
    const mkdirSpy = jest.spyOn(fsMock, 'mkdirSync').mockImplementation(() => {});
    const writeSpy = jest.spyOn(fsMock, 'writeFileSync').mockImplementation(() => {});

    const freshDb = require('../db/db');
    await freshDb.initDb();

    // run() calls saveDb() internally — this triggers the disk-write branch
    freshDb.run('INSERT INTO users (name, email, passwordHash, favoriteClub) VALUES (?,?,?,?)', [
      'Save Test', 'save@example.com', 'hash', 'Chelsea'
    ]);

    expect(mkdirSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });
});
