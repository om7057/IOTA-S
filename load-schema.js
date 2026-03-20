#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { sequelize } from './server/config/sequelize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function executeWithPsql(host, port, user, database, password, sqlFile) {
  return new Promise((resolve, reject) => {
    const psql = spawn('psql', [
      '-h', host,
      '-p', port.toString(),
      '-U', user,
      '-d', database,
      '-f', sqlFile,
      '-v', 'ON_ERROR_STOP=1'
    ], {
      env: {
        ...process.env,
        PGPASSWORD: password
      }
    });

    let errorOutput = '';
    let output = '';

    psql.stdout.on('data', (data) => {
      output += data.toString();
    });

    psql.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    psql.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`psql failed with code ${code}: ${errorOutput}`));
      }
    });

    psql.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    // Check if users table exists using raw query
    const [tables] = await sequelize.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    const tableNames = tables.map(t => t.tablename);
    
    if (!tableNames.includes('users')) {
      console.log('📋 Base schema not found, loading init-db.sql via psql...');
      const schemaPath = path.join(__dirname, 'init-db.sql');
      console.log(`📄 Reading: ${schemaPath}`);
      
      // Get database config from environment
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        database: process.env.DB_NAME || 'iota_db',
        password: process.env.DB_PASSWORD || 'postgres'
      };

      try {
        await executeWithPsql(
          dbConfig.host,
          dbConfig.port,
          dbConfig.user,
          dbConfig.database,
          dbConfig.password,
          schemaPath
        );
        console.log('✅ Schema loaded successfully via psql');
      } catch (err) {
        if (err.message.includes('psql: command not found')) {
          console.log('⚠️  psql not found, falling back to Sequelize...');
          // Fallback: try to execute SQL manually
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          const regex = /[^;]*;/g;
          const statements = [];
          let match;
          
          while ((match = regex.exec(schemaSql)) !== null) {
            const stmt = match[0].trim();
            if (stmt && !stmt.match(/^--[\s\S]*?$/m)) {
              statements.push(stmt);
            }
          }
          
          console.log(`🔨 Executing ${statements.length} statements...`);
          for (const statement of statements) {
            if (statement.trim().length > 0) {
              try {
                await sequelize.query(statement, { raw: true });
              } catch (e) {
                if (!e.message.includes('already exists') && 
                    !e.message.includes('already defined') &&
                    !e.message.includes('duplicate')) {
                  console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
                  throw e;
                }
              }
            }
          }
          console.log('✅ Schema loaded successfully');
        } else {
          throw err;
        }
      }
    } else {
      console.log('✅ Base schema already exists');
    }

    // Check if story_attempts exists
    const [refreshedTables] = await sequelize.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    const refreshedTableNames = refreshedTables.map(t => t.tablename);
    
    if (!refreshedTableNames.includes('story_attempts')) {
      console.log('✅ story_attempts table ready to be created by migration');
    } else {
      console.log('✅ story_attempts table already exists');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

main();
