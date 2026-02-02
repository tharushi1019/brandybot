/**
 * Brand Model
 * Stores complete brand identity information
 */

const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    // Reference to User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },

    // Brand name
    brandName: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true,
        maxlength: [100, 'Brand name cannot exceed 100 characters'],
        index: true
    },

    // Brand tagline/slogan
    tagline: {
        type: String,
        trim: true,
        maxlength: [200, 'Tagline cannot exceed 200 characters'],
        default: ''
    },

    // Brand description
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },

    // Industry/category
    industry: {
        type: String,
        trim: true,
        default: ''
    },

    // Target audience
    targetAudience: {
        type: String,
        trim: true,
        default: ''
    },

    // Logo information
    logo: {
        primaryLogoUrl: {
            type: String,
            required: [true, 'Primary logo URL is required']
        },
        alternativeLogos: [{
            type: String
        }],
        logoVariants: {
            light: String,  // Logo for light backgrounds
            dark: String,   // Logo for dark backgrounds
            icon: String,   // Icon/favicon version
            horizontal: String,  // Horizontal layout
            vertical: String     // Vertical layout
        }
    },

    // Brand guidelines
    guidelines: {
        // Color palette
        colors: {
            primary: {
                name: String,
                hex: String,
                rgb: String,
                cmyk: String
            },
            secondary: {
                name: String,
                hex: String,
                rgb: String,
                cmyk: String
            },
            accent: {
                name: String,
                hex: String,
                rgb: String,
                cmyk: String
            },
            additional: [{
                name: String,
                hex: String,
                rgb: String,
                cmyk: String
            }]
        },

        // Typography
        typography: {
            primaryFont: {
                name: String,
                family: String,
                weights: [String],
                usage: String
            },
            secondaryFont: {
                name: String,
                family: String,
                weights: [String],
                usage: String
            }
        },

        // Logo usage rules
        logoUsage: {
            minimumSize: String,
            clearSpace: String,
            doNots: [String],
            dos: [String]
        },

        // Brand voice and tone
        voice: {
            personality: [String],
            tone: String,
            keywords: [String]
        }
    },

    // Mockups
    mockups: {
        businessCard: {
            frontUrl: String,
            backUrl: String
        },
        letterhead: String,
        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String,
            linkedin: String
        },
        merchandise: {
            tshirt: String,
            mug: String,
            bag: String,
            other: [String]
        },
        digital: {
            website: String,
            mobileApp: String,
            email: String
        }
    },

    // Brand assets
    assets: {
        guidelinePdfUrl: String,
        logoPackageUrl: String,  // ZIP file with all logo variants
        mockupPackageUrl: String, // ZIP file with all mockups
        brandKitUrl: String       // Complete brand kit
    },

    // Brand status
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'active'
    },

    // Whether brand is public (for sharing)
    isPublic: {
        type: Boolean,
        default: false
    },

    // Share link (if public)
    shareLink: {
        type: String,
        unique: true,
        sparse: true  // Allows null values to be non-unique
    },

    // Version tracking
    version: {
        type: Number,
        default: 1
    },

    // Last updated by
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    collection: 'brands'
});

// Indexes for performance
brandSchema.index({ userId: 1, createdAt: -1 });
brandSchema.index({ brandName: 1, userId: 1 });
brandSchema.index({ status: 1 });
brandSchema.index({ isPublic: 1 });
brandSchema.index({ shareLink: 1 });

// Instance method to generate share link
brandSchema.methods.generateShareLink = function () {
    const randomString = Math.random().toString(36).substring(2, 15);
    this.shareLink = `${this._id}-${randomString}`;
    this.isPublic = true;
    return this.save();
};

// Instance method to archive brand
brandSchema.methods.archive = function () {
    this.status = 'archived';
    return this.save();
};

// Instance method to activate brand
brandSchema.methods.activate = function () {
    this.status = 'active';
    return this.save();
};

// Instance method to increment version
brandSchema.methods.incrementVersion = function () {
    this.version += 1;
    this.lastUpdatedBy = this.userId;
    return this.save();
};

// Static method to find user's brands
brandSchema.statics.findByUserId = function (userId, status = 'active') {
    const query = { userId };
    if (status) {
        query.status = status;
    }
    return this.find(query)
        .sort({ updatedAt: -1 })
        .populate('userId', 'displayName email');
};

// Static method to find brand by share link
brandSchema.statics.findByShareLink = function (shareLink) {
    return this.findOne({ shareLink, isPublic: true });
};

// Static method to get brand count for user
brandSchema.statics.countUserBrands = function (userId) {
    return this.countDocuments({ userId, status: 'active' });
};

// Pre-save hook to update lastUpdatedBy
brandSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdatedBy = this.userId;
    }
    next();
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
