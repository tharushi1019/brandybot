const { sql } = require('../config/db');
const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');

/**
 * @desc    Get current user's credit balance
 * @route   GET /api/credits
 * @access  Private
 */
exports.getCredits = catchAsync(async (req, res, next) => {
    let [credits] = await sql`
        SELECT * FROM user_credits WHERE user_id = ${req.user.id}
    `;

    // Auto-create if missing (edge case for old accounts without a credits row)
    if (!credits) {
        [credits] = await sql`
            INSERT INTO user_credits (user_id, balance)
            VALUES (${req.user.id}, 3)
            ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
            RETURNING *
        `;
    }

    res.status(200).json({
        success: true,
        data: credits
    });
});

/**
 * @desc    Get credit transaction history
 * @route   GET /api/credits/history
 * @access  Private
 */
exports.getCreditHistory = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const transactions = await sql`
        SELECT * FROM credit_transactions
        WHERE user_id = ${req.user.id}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
        SELECT count(*) as count FROM credit_transactions WHERE user_id = ${req.user.id}
    `;

    res.status(200).json({
        success: true,
        count: transactions.length,
        total: parseInt(count, 10),
        data: transactions
    });
});

/**
 * @desc    Create a purchase intent (placeholder for PayPal)
 * @route   POST /api/credits/purchase
 * @access  Private
 */
exports.purchaseCredits = catchAsync(async (req, res, next) => {
    const { packageId } = req.body;

    const packages = {
        starter:  { credits: 50,  price: 4.99,  label: 'Starter Pack' },
        pro:      { credits: 150, price: 9.99,  label: 'Pro Pack' },
        unlimited:{ credits: 500, price: 24.99, label: 'Unlimited Pack' }
    };

    const pkg = packages[packageId];
    if (!pkg) {
        return next(new AppError('Invalid package. Choose: starter, pro, unlimited', 400));
    }

    // TODO: Integrate PayPal API here in future
    // For now record a pending purchase order and return payment info
    const [order] = await sql`
        INSERT INTO credit_transactions (user_id, type, amount, description)
        VALUES (${req.user.id}, 'purchase', ${pkg.credits}, ${'Pending: ' + pkg.label + ' - $' + pkg.price})
        RETURNING *
    `;

    res.status(200).json({
        success: true,
        message: 'Purchase order created. PayPal integration coming soon!',
        data: {
            orderId: order.id,
            package: pkg,
            status: 'pending',
            paymentUrl: null  // Will be PayPal URL in future
        }
    });
});

/**
 * Helper: Deduct one credit from the user and log the transaction
 * @param {string} userId - User UUID
 * @param {string} logoId - Reference logo_history.id
 */
exports.deductCredit = async (userId, logoId = null) => {
    // Atomically decrement balance and check it's not going negative
    const [result] = await sql`
        UPDATE user_credits
        SET balance = balance - 1, total_used = total_used + 1, updated_at = NOW()
        WHERE user_id = ${userId} AND balance > 0
        RETURNING balance
    `;

    if (!result) {
        throw new AppError('Insufficient credits. Please purchase more credits to continue.', 402);
    }

    // Log transaction
    await sql`
        INSERT INTO credit_transactions (user_id, type, amount, description, reference_id)
        VALUES (${userId}, 'use', -1, 'Logo generation', ${logoId})
    `;

    return result.balance;
};
