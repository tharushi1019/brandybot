const { sql } = require("./config/db");

async function dumpLogos() {
    try {
        const logos = await sql`
            SELECT l.id, l.user_id, u.email, l.brand_name, l.status, l.logo_url
            FROM logo_history l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT 20
        `;
        console.log("Recent Logos (All Users):");
        console.table(logos);
    } catch (e) {
        console.error("Dump failed:", e.message);
    } finally {
        process.exit();
    }
}

dumpLogos();
