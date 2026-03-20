import dotenv from 'dotenv';
import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

dotenv.config();

const BATCH_SIZE = 1000;

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'MONGODB_URI'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || process.env.DB_NAME || 'iota_db';

const dropExisting = process.argv.includes('--drop');

const quoteIdent = (identifier) => `"${String(identifier).replace(/"/g, '""')}"`;

async function getPublicTables(pgClient) {
  const result = await pgClient.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `
  );

  return result.rows.map((row) => row.table_name);
}

async function migrateTable(pgClient, mongoDb, tableName) {
  const collection = mongoDb.collection(tableName);

  if (dropExisting) {
    await collection.deleteMany({});
  }

  const countResult = await pgClient.query(`SELECT COUNT(*)::int AS count FROM ${quoteIdent(tableName)}`);
  const totalRows = countResult.rows[0]?.count || 0;

  if (totalRows === 0) {
    console.log(`[skip] ${tableName}: 0 rows`);
    return { tableName, totalRows, insertedRows: 0 };
  }

  let insertedRows = 0;

  for (let offset = 0; offset < totalRows; offset += BATCH_SIZE) {
    const batchResult = await pgClient.query(
      `SELECT * FROM ${quoteIdent(tableName)} ORDER BY 1 OFFSET $1 LIMIT $2`,
      [offset, BATCH_SIZE]
    );

    const rows = batchResult.rows;
    if (rows.length === 0) {
      break;
    }

    await collection.insertMany(rows, { ordered: false });
    insertedRows += rows.length;
    console.log(`[migrate] ${tableName}: ${insertedRows}/${totalRows}`);
  }

  return { tableName, totalRows, insertedRows };
}

async function run() {
  const pgClient = await pgPool.connect();
  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db(mongoDbName);

    console.log(`Connected to PostgreSQL: ${process.env.DB_NAME}`);
    console.log(`Connected to MongoDB: ${mongoDbName}`);
    console.log(`Drop existing collections data: ${dropExisting ? 'yes' : 'no'}`);

    const tables = await getPublicTables(pgClient);

    if (tables.length === 0) {
      console.log('No public tables found.');
      return;
    }

    console.log(`Found ${tables.length} tables to migrate.`);

    const summary = [];

    for (const tableName of tables) {
      const result = await migrateTable(pgClient, mongoDb, tableName);
      summary.push(result);
    }

    const totals = summary.reduce(
      (acc, item) => {
        acc.tables += 1;
        acc.rows += item.insertedRows;
        return acc;
      },
      { tables: 0, rows: 0 }
    );

    await mongoDb.collection('_migration_meta').insertOne({
      source: 'postgresql',
      sourceDatabase: process.env.DB_NAME,
      targetDatabase: mongoDbName,
      tablesMigrated: totals.tables,
      rowsMigrated: totals.rows,
      dropExisting,
      migratedAt: new Date(),
    });

    console.log(`Migration complete: ${totals.tables} tables, ${totals.rows} rows migrated.`);
  } finally {
    pgClient.release();
    await pgPool.end();
    await mongoClient.close();
  }
}

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
