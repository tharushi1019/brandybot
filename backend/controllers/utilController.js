const { catchAsync } = require('../utils/errorHandler');
const { AppError } = require('../utils/AppError');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload a completely raw binary buffer to ImgBB.
 */
const uploadBufferToImgBB = async (imageBuffer) => {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) throw new Error("IMGBB_API_KEY not configured in environment variables");

    // ImgBB requires base64 encoded string format for buffer uploads via its API wrapper
    const base64Data = imageBuffer.toString('base64');

    const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        new URLSearchParams({ image: base64Data }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data.data.url;
};

/**
 * @desc    Remove background from an image URL and return a new transparent URL
 * @route   POST /api/utils/remove-bg
 * @access  Private
 */
exports.removeBackground = catchAsync(async (req, res, next) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return next(new AppError('Image URL is required', 400));
    }

    const removeBgKey = process.env.REMOVE_BG_API_KEY;
    if (!removeBgKey) {
        return next(new AppError('Remove.bg API key not configured', 500));
    }

    console.log(`✂️ Removing background for: ${imageUrl}`);

    try {
        // 1. Call Remove.bg API by passing the image URL
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_url', imageUrl);

        const removeBgResponse = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'X-Api-Key': removeBgKey
                },
                responseType: 'arraybuffer' // We need the raw PNG binary
            }
        );

        if (removeBgResponse.status !== 200) {
            throw new Error(`Remove.bg returned status ${removeBgResponse.status}`);
        }

        console.log('✅ Background removed. Re-uploading to ImgBB...');

        // 2. Upload the transparent binary directly to ImgBB
        const transparentImgBuffer = Buffer.from(removeBgResponse.data);
        const newImgUrl = await uploadBufferToImgBB(transparentImgBuffer);

        console.log(`🚀 New transparent URL generated: ${newImgUrl}`);

        res.status(200).json({
            success: true,
            data: {
                transparentUrl: newImgUrl
            }
        });

    } catch (error) {
        console.error('Background removal failed:', error.message);
        return next(new AppError('Failed to remove background. The API may be out of credits or the image is invalid.', 500));
    }
});
