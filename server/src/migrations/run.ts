import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  console.log('🔄 Running migrations...');

  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`  📄 Executing: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    // Check for conditional marker: ##CONDITIONAL_IF_EMPTY:tablename##
    const conditionalMatch = sql.match(/##CONDITIONAL_IF_EMPTY:(\w+)##/);
    if (conditionalMatch) {
      const tableName = conditionalMatch[1];
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
        const count = (rows as any)[0]?.cnt || 0;
        if (count > 0) {
          console.log(`    ⏭️  Skipped (${tableName} already has ${count} rows)`);
          continue;
        }
      } catch (e: any) {
        // Table doesn't exist yet — proceed with migration
      }
    }

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('##'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error: any) {
        // Ignore "already exists" errors for idempotency
        const ignorable = ['ER_TABLE_EXISTS_ERROR', 'ER_DB_CREATE_EXISTS', 'ER_DUP_KEYNAME', 'ER_DUP_FIELDNAME', 'ER_CANT_DROP_FIELD_OR_KEY'];
        if (ignorable.includes(error.code)) {
          console.log(`    ⏭️  Skipped (${error.code})`);
        } else {
          console.error(`    ❌ Error: ${error.message}`);
          throw error;
        }
      }
    }
    console.log(`    ✅ Done`);
  }

  console.log('✅ All migrations completed');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
