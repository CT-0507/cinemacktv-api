const Cinema = require('../models/Cinema')
const asyncHandler = require('express-async-handler')
const formidable = require('formidable')
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// @desc Get all cinema
// @route GET /cinema
// @access Public
const getAllCinemas = asyncHandler(async (req, res) => {
    const cinemas = await Cinema.find().lean()
    if (!cinemas?.length) {
        return res.status(400).json({ message: 'No cinema found' })
    }
    res.json(cinemas)
})
// @desc Create new cinema
// @route POST /cinema
// @access Private
const createNewCinema = asyncHandler(async (req, res, next) => {
    const form = formidable()
    var errMsg
    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
            errMsg = err
            return
        }
        const { cinemaName, location, description, rooms, active } = fields
        const isBoolean = val => 'boolean' === typeof val;
        if (!cinemaName || !location || !description && isBoolean(active)) {
            errMsg = "All field are required"
            console.log(errMsg)
            next(errMsg)
            return
        }
        const roomsList = rooms.split(",").map((item) => item.trim())
        console.log(typeof files)
        for (const [key, value] of Object.entries(files)) {
            console.log(`${value}`);
        }
        const filesArray = Object.values(files)
        console.log(filesArray)
        let fileNameArray = []
        filesArray.forEach((picture, index) => {
            var oldpath = picture.filepath
            var split = picture.originalFilename.split(".")
            var fileEx = split[split.length - 1]
            var fileName = `cinema-picture-${index}-${randomUUID().substring(1, 8)}.${fileEx}`
            var newpath = path.join(__dirname, "..", "public", fileName)
            fs.copyFile(oldpath, newpath, (err) => {
                if (err || errMsg) {
                    res.status(501).json({ err: "cannot save file" })
                    errMsg = "Error"
                    return
                }

            })
            fileNameArray.push(fileName)
        })

        if (errMsg) return
        const cinemaObject = { cinemaName, location, description, rooms: roomsList, active, cinemaPicture: fileNameArray }
        const cinema = await Cinema.create(cinemaObject)
        if (cinema) {
            res.status(201).json({ message: `New Cinema ${cinema.cinemaName} created` })
        }
        else {
            res.status(400).json({ message: 'Invalid Cinema data received' })
        }
    })
})
// @desc Update cinema
// @route PATCH /cinema
// @access Private
const updateCinema = asyncHandler(async (req, res) => {
    const form = formidable()
    form.parse()
})
// @desc Delete a cinema
// @route DELETE /cinemas
// @access Private
const deleteCinema = asyncHandler(async (req, res) => {
    const { id } = req.body
    console.log(req.body)
    if (!id) {
        return res.status(400).json({ message: 'Ciname ID Required' })
    }

    const cinema = await Cinema.findById(id).exec()

    if (!cinema) {
        return res.status(400).json({ message: 'Ciname not found' })
    }
    let errMsg
    cinema.cinemaPicture.forEach((picture, index) => {
        const filePath = path.join(__dirname, "..", "public", picture)
        console.log(picture)
        fs.stat(filePath, function (err, stats) {
            console.log(stats);//here we got all information of file in stats variable

            if (err) {
                errMsg = err
                console.log(err)
                return console.error(err);
            }

            fs.unlink(filePath, function (err) {
                if (err) { errMsg = err; console.log(err) }
                console.log('file deleted successfully');
            });
        });
    })

    if (errMsg) return
    const result = await cinema.deleteOne()

    const reply = `Ciname ${result.cinemaName} with ID ${result._id} deleted`

    res.json(reply)
})
module.exports = {
    getAllCinemas,
    createNewCinema,
    deleteCinema,
}