const mongoose = require('mongoose')

const premiereSlotSchema = new mongoose.Schema(
    {
        filmId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Film'
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true
        },
        cinema: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Cinema'
        },
        room: {
            type: String,
            required: true,
        },
        seatStatus: [
            [
                {
                    id: {
                        type: Number,
                    },
                    number: {
                        type: String,
                    },
                    isReserved: {
                        type: Boolean,
                    }
                }
            ]
        ],
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('PremiereSlot', premiereSlotSchema)