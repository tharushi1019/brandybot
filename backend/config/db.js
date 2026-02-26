require('dotenv').config();
const postgres = require('postgres');

// Lazy-initialized SQL client — created on first use to avoid crashes
// when DATABASE_URL is missing (e.g., in test mode or missing .env)
let _sql = null;

const getSQL = () => {
    if (!_sql) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set. Cannot connect to PostgreSQL.');
        }
        _sql = postgres(process.env.DATABASE_URL, {
            ssl: 'require' // Supabase requires SSL
        });
    }
    return _sql;
};

// Proxy that lazily creates the client on first template-tag usage
const sql = new Proxy(function () { }, {
    apply(target, thisArg, args) {
        return getSQL()(...args);
    },
    get(target, prop) {
        return getSQL()[prop];
    }
});

const connectDB = async () => {
    try {
        // Run a simple test query to verify connection
        const client = getSQL();
        const [{ version }] = await client`SELECT version()`;
        console.log('✅ Supabase PostgreSQL Connected');
        console.log(`📊 DB Version: ${version.split(' ')[1]}`);
    } catch (error) {
        console.error(`❌ PostgreSQL Connection Error: ${error.message}`);
        // Retry connection after 5 seconds
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Export the sql proxy and connectDB
module.exports = { sql, connectDB };
