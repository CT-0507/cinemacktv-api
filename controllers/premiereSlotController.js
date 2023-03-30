const PremiereSlot = require('../models/PremiereSlot')
const asyncHandler = require('express-async-handler')
const type1 = require('../config/roomType')
const Cinema = require('../models/Cinema')
const Film = require('../models/Film')
const mongoose = require('mongoose');
// @desc Get all premiereSlot
// @route GET /premiere-slot
// @access Public
const getAllPremiereSlot = asyncHandler(async (req, res) => {
    const premiereSlots = await PremiereSlot.find().populate('filmId', 'filmName').populate('cinema', 'cinemaName').lean()
    if (!premiereSlots?.length) {
        return res.status(400).json({ message: 'No Slots found' })
    }
    res.json(premiereSlots)
})
// @desc Create new premiere
// @route POST /premiere-slot
// @access Private
const createNewPremiereSlot = asyncHandler(async (req, res) => {
    const { filmId, date, time, cinema, room } = req.body
    console.log(req.body)
    //Confirm data
    if (!filmId || !date || !cinema || !room || !time) {
        return res.status(400).json({ message: 'Missing required fields' })
    }
    const duplicate = await PremiereSlot.findOne({ filmId, cinema })
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate filmId and cinema' })
    }
    const cinemaId = mongoose.Types.ObjectId(cinema)
    const cinemaObject = await Cinema.findById({ _id: cinemaId }).exec()
    if (!cinemaObject || !cinemaObject.rooms.includes(room)) {
        return res.status(404).json({ message: `Cinema Id ${cinema} does not exist room Id ${room}` })
    }
    const filmIdObject = mongoose.Types.ObjectId(filmId)
    const filmObject = await Film.findById({ _id: filmIdObject }).exec()
    if (!filmObject) {
        return res.status(404).json({ message: `Film ${filmObject.filmName} does not exist` })
    }
    const premiereSlotObject = { filmId: filmObject._id, date, time, cinema: cinemaObject._id, room, seatStatus: type1 }

    const premiereSlot = await PremiereSlot.create(premiereSlotObject)

    if (premiereSlot) { //created
        res.status(201).json({ message: `New slot ${premiereSlot?._id} created` })
    } else {
        res.status(400).json({ message: 'Invalid slot data received' })
    }
})
// @desc Update a premiere-slot
// @route PATCH /premiere-slot
// @access Private
const updatePremiereSlot = asyncHandler(async (req, res) => {
    const { id, filmId, date, time, cinema, room } = req.body
    console.log(req.body)
    //Confirm data
    if (!filmId || !date || !cinema || !room || !time) {
        return res.status(400).json({ message: 'Missing required fields' })
    }

    const premiereSlot = await PremiereSlot.findById(id).exec()

    if (!premiereSlot) {
        return res.status(400).json({ message: 'Premiere slot not found' })
    }
    // Check for duplicate
    const duplicate = await PremiereSlot.findOne({ filmId, cinema })
    //Allow updates to the original premiereSlot
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate cinema and filmId' })
    }
    premiereSlot.filmId = filmId
    premiereSlot.date = date
    premiereSlot.time = time
    premiereSlot.cinema = cinema
    premiereSlot.room = room

    const updatePremiereSlot = await premiereSlot.save()

    res.json({ message: `${updatePremiereSlot._id} updated` })
})

// @desc Delete a premiere-slot
// @route DELETE /premiere-slot
// @access Private
const deletePremiereSlot = asyncHandler(async (req, res) => {
    const { id } = req.body
    console.log(req.body)
    if (!id) {
        return res.status(400).json({ message: 'Slot ID Required' })
    }
    const premiereSlot = await PremiereSlot.findById(id).exec()

    if (!premiereSlot) {
        return res.status(400).json({ message: 'Slot not found' })
    }
    const result = await premiereSlot.deleteOne()

    const reply = `Slot ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllPremiereSlot,
    createNewPremiereSlot,
    updatePremiereSlot,
    deletePremiereSlot
}