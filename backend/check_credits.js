const { sql } = require("./config/db");

async function checkCredits() {
    try {
        const credits = await sql`
            SELECT u.email, c.balance
            FROM users u
            JOIN user_credits c ON u.id = c.user_id
        `;
        console.log("Credits for all users:");
        console.table(credits);
    } catch (e) {
        console.error("Credit check failed:", e.message);
    } finally {
        process.exit();
    }
}

checkCredits();
