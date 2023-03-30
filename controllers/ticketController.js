const PremiereSlot = require('../models/PremiereSlot')
const asyncHandler = require('express-async-handler')
const type1 = require('../config/roomType')
const Cinema = require('../models/Cinema')
const Film = require('../models/Film')
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket')
const User = require('../models/User')

// @desc Get all ticket
// @route GET /tickets
// @access Public
const getAllTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find().populate('filmId', 'filmName').populate('cinema', 'cinemaName').populate("userId", "username").populate('slotId').lean()
    if (!tickets?.length) {
        return res.status(400).json({ message: 'No tickets found' })
    }
    res.json(tickets)
})

const createNewTicket = asyncHandler(async (req, res) => {
    const { userId, slotId, filmId, cinema, seats, discountCode, total, note } = req.body
    console.log(req.body)

    if (!userId || !slotId || !filmId || !cinema || !seats || !total) {
        return res.status(400).json({ message: 'Missing required fields' })
    }
    const seatsArray = seats.split(",").map(item => item.trim())
    console.log(seatsArray)
    const duplicate = await Ticket.findOne({ userId, filmId, cinema, seats: seatsArray })

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate Ticket' })
    }
    const userIdObjectId = mongoose.Types.ObjectId(userId)
    const userObject = await User.findById({ _id: userIdObjectId }).exec()
    if (!userObject) {
        return res.status(404).json({ message: `User ${userId} not found` })
    }
    const filmIdObject = mongoose.Types.ObjectId(filmId)
    const filmObject = await Film.findById({ _id: filmIdObject }).exec()
    if (!filmObject) {
        return res.status(404).json({ message: `Film ${filmObject.filmName} does not exist` })
    }
    const slotIdObjectId = mongoose.Types.ObjectId(slotId)
    const slotObject = await PremiereSlot.findOne({ slotIdObjectId })
    if (!slotObject) {
        return res.status(404).json({ message: `Slot ${slotId} does not exist` })
    }
    var conflictError
    seatsArray.forEach((book, index) => {
        slotObject.seatStatus.forEach((row, index) => {
            row.forEach((seat, seatIndex) => {
                if (seat) {
                    if (seat.number === book) {
                        console.log(seat)
                        if (!seat.isReserved) {
                            seat.isReserved = true
                        } else conflictError = "seat is already taken"
                    }
                }
            })
        })
    })
    console.log(conflictError)
    if (conflictError) {
        return res.status(409).json({ message: conflictError })
    }
    const updatePremiereSlot = await slotObject.save()
    const ticketObject = { filmId: slotObject.filmId, userId: userObject._id, slotId: slotObject._id, cinema: slotObject.cinema, seats: seatsArray, discountCode, total, note }
    console.log(ticketObject)
    const ticket = await Ticket.create(ticketObject)
    if (!updatePremiereSlot) {
        res.status(400).json({ message: 'Invalid slot data received in Slot' })
    }
    if (ticket) {
        res.status(201).json({ message: `booking complete` })
    } else {
        res.status(400).json({ message: 'Invalid slot data received in ticket' })
    }
})

const deleteTicket = asyncHandler(async (req, res) => {
    const { id } = req.body
    console.log(req.body)
    if (!id) {
        return res.status(400).json({ message: 'Ticket ID Required' })
    }
    const ticket = await Ticket.findById(id).exec()

    if (!ticket) {
        return res.status(400).json({ message: 'Ticket not found' })
    }
    const result = await Ticket.deleteOne()

    const reply = `Ticket ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllTickets,
    createNewTicket,
    deleteTicket
}