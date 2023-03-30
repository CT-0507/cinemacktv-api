const mongoose = require('mongoose')
const discountCodeSchema = new mongoose.Schema(
    {
        issuesBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        discountAmount: {
            type: Number,
            required: true,
        },
        discountType: {
            type: String,
            required: true,
        },
        discountCode: {
            type: String,
            required: true,
        },
        note: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('DiscountCode', discountCodeSchema)