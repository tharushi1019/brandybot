const { sql } = require("./config/db");

async function checkUserStats() {
    try {
        const users = await sql`
            SELECT id, email, stats, (SELECT count(*) FROM logo_history WHERE user_id = users.id) as actual_count
            FROM users
            WHERE email = 'tharushinimnadi.k@gmail.com'
        `;
        console.log("User Stats vs Actual Count:");
        console.table(users);
    } catch (e) {
        console.error("Stats check failed:", e.message);
    } finally {
        process.exit();
    }
}

checkUserStats();
