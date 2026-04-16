const { sql } = require("./config/db");

async function checkSchema() {
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log("Tables:", tables.map(t => t.table_name).join(", "));

        for (const table of tables) {
            const columns = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = ${table.table_name}
            `;
            console.log(`\nTable: ${table.table_name}`);
            columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
        }
    } catch (e) {
        console.error("Schema check failed:", e.message);
    } finally {
        process.exit();
    }
}

checkSchema();
