const { sql } = require("./config/db");

async function checkLogos() {
    try {
        const logos = await sql`
            SELECT id, user_id, brand_name, status, logo_url, created_at
            FROM logo_history
            WHERE user_id = 'c7463b43-42b1-47a2-8022-306d554a8789'
        `;
        console.log("Logos for Tharushi:");
        console.table(logos);
    } catch (e) {
        console.error("Logo check failed:", e.message);
    } finally {
        process.exit();
    }
}

checkLogos();
