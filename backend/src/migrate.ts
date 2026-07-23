import db from './config/database';
import fs from 'fs';
import path from 'path';

function migrate() {
    try {
        console.log('🔄 Running migrations...');

        const schema = fs.readFileSync(
            path.join(__dirname, 'schema.sql'),
            'utf-8'
        );

        db.exec(schema);
        console.log('✅ Migration complete — all tables created');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();