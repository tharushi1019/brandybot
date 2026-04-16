const { sql } = require("./config/db");

async function checkUserData() {
    try {
        // 1. List all users and their logo counts
        const userSummary = await sql`
            SELECT u.id, u.uid, u.email, COUNT(l.id) as logo_count
            FROM users u
            LEFT JOIN logo_history l ON u.id = l.user_id
            GROUP BY u.id, u.uid, u.email
        `;
        console.log("User Data Summary:");
        console.table(userSummary);

        // 2. Check if there are any orphaned logos (logos with user_id that doesn't exist in users)
        const orphanedLogos = await sql`
            SELECT l.user_id, COUNT(*) as count
            FROM logo_history l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE u.id IS NULL
            GROUP BY l.user_id
        `;
        if (orphanedLogos.length > 0) {
            console.log("\n⚠️ Orphaned Logos Found (No matching user in public.users):");
            console.table(orphanedLogos);
        } else {
            console.log("\n✅ No orphaned logos found.");
        }

    } catch (e) {
        console.error("Data check failed:", e.message);
    } finally {
        process.exit();
    }
}

checkUserData();
