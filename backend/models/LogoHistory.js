/**
 * LogoHistory Model
 * Stores history of logo generation requests and results
 */

const mongoose = require('mongoose');

const logoHistorySchema = new mongoose.Schema({
    // Reference to User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },

    // Brand name for the logo
    brandName: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true,
        maxlength: [100, 'Brand name cannot exceed 100 characters']
    },

    // User's prompt/description
    prompt: {
        type: String,
        required: [true, 'Prompt is required'],
        trim: true,
        maxlength: [500, 'Prompt cannot exceed 500 characters']
    },

    // Industry/category
    industry: {
        type: String,
        trim: true,
        default: ''
    },

    // Logo style preference
    style: {
        type: String,
        enum: ['modern', 'classic', 'minimalist', 'playful', 'elegant', 'bold', 'other'],
        default: 'modern'
    },

    // Generated logo URL (from AI service or storage)
    logoUrl: {
        type: String,
        required: [true, 'Logo URL is required']
    },

    // Alternative logo URLs (if multiple generated)
    alternativeLogos: [{
        type: String
    }],

    // Color palette used
    colors: {
        primary: {
            type: String,
            default: '#000000'
        },
        secondary: {
            type: String,
            default: '#FFFFFF'
        },
        accent: {
            type: String,
            default: '#FF0000'
        },
        additional: [{
            type: String
        }]
    },

    // Font selections
    fonts: {
        primary: {
            type: String,
            default: 'Arial'
        },
        secondary: {
            type: String,
            default: 'Helvetica'
        }
    },

    // Logo metadata
    metadata: {
        width: {
            type: Number,
            default: 1024
        },
        height: {
            type: Number,
            default: 1024
        },
        format: {
            type: String,
            enum: ['png', 'jpg', 'svg', 'webp'],
            default: 'png'
        },
        fileSize: {
            type: Number, // in bytes
            default: 0
        }
    },

    // User rating/feedback
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },

    // Whether user selected this logo
    isSelected: {
        type: Boolean,
        default: false
    },

    // Whether logo was downloaded
    isDownloaded: {
        type: Boolean,
        default: false
    },

    // Generation status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'completed'
    },

    // Error message if generation failed
    errorMessage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'logo_history'
});

// Indexes for performance
logoHistorySchema.index({ userId: 1, createdAt: -1 });
logoHistorySchema.index({ brandName: 1 });
logoHistorySchema.index({ isSelected: 1 });
logoHistorySchema.index({ status: 1 });

// Instance method to mark as selected
logoHistorySchema.methods.markAsSelected = function () {
    this.isSelected = true;
    return this.save();
};

// Instance method to mark as downloaded
logoHistorySchema.methods.markAsDownloaded = function () {
    this.isDownloaded = true;
    return this.save();
};

// Instance method to add rating
logoHistorySchema.methods.addRating = function (rating) {
    if (rating >= 1 && rating <= 5) {
        this.rating = rating;
        return this.save();
    }
    throw new Error('Rating must be between 1 and 5');
};

// Static method to find user's logo history
logoHistorySchema.statics.findByUserId = function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'displayName email');
};

// Static method to find selected logos
logoHistorySchema.statics.findSelectedLogos = function (userId) {
    return this.find({ userId, isSelected: true })
        .sort({ createdAt: -1 });
};

// Static method to get logo statistics
logoHistorySchema.statics.getStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalLogos: { $sum: 1 },
                selectedLogos: {
                    $sum: { $cond: ['$isSelected', 1, 0] }
                },
                downloadedLogos: {
                    $sum: { $cond: ['$isDownloaded', 1, 0] }
                },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    return stats[0] || {
        totalLogos: 0,
        selectedLogos: 0,
        downloadedLogos: 0,
        averageRating: 0
    };
};

const LogoHistory = mongoose.model('LogoHistory', logoHistorySchema);

module.exports = LogoHistory;
