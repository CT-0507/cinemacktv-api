const mongoose = require('mongoose')
const ticketSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        slotId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'PremiereSlot',
        },
        filmId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Film',
        },
        cinema: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Cinema',
        },
        seats: [
            {
                type: String,
                required: true
            }
        ],
        discountCode: {
            type: String,
        },
        total: {
            type: Number,
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

module.exports = mongoose.model('Ticket', ticketSchema)