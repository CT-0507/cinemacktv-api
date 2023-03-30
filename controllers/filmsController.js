const Film = require('../models/Film')
const asyncHandler = require('express-async-handler')
const formidable = require('formidable')
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const mongoose = require("mongoose")
// @desc Get all films
// @route GET /films
// @access Public
const getAllFilms = asyncHandler(async (req, res) => {
    const films = await Film.find().lean()
    if (!films?.length) {
        return res.status(400).json({ message: 'No films found' })
    }
    res.json(films)
})
// @desc Create new films
// @route POST /films
// @access Private
const createNewFilm = asyncHandler(async (req, res, next) => {
    const form = formidable()
    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
            return;
        }

        var oldpath = files.poster.filepath;
        var split = files.poster.originalFilename.split(".")
        var fileEx = split[split.length - 1]
        var fileName = `poster-${randomUUID()}.${fileEx}`
        var newpath = path.join(__dirname, "..", "public", fileName)
        var saveFileErr
        const { directors, actors, tags, premiereDay, filmName, description, rated, trailerLink, language, time, filmStatus } = fields
        console.log(fields, files)
        if (!directors || !actors || !tags || !premiereDay || !filmName || !description || !rated || !trailerLink || !time || !language || !filmStatus) {
            saveFileErr = "All field are required "
            return res.status(400).json({ message: 'All field are required' })
        }
        const directorsList = directors.split(",").map((item) => item.trim())
        const actorsList = actors.split(",").map((item) => item.trim())
        const tagsList = tags.split(",").map((item) => item.trim())
        if ([directorsList, actorsList, tagsList].every(item => !item.length && !Array.isArray(item))) {
            return res.status(400).json({ message: 'Body contents invalid field' })
        }
        fs.copyFile(oldpath, newpath, function (err) {
            if (err && !saveFileErr) {
                console.log("er")
                res.status(501).json({ err: "cannot save file" })
                saveFileErr = err
            }
        });
        if (saveFileErr) return;
        const filmObject = { filmName, directors: directorsList, actors: actorsList, tags: tagsList, premiereDay, poster: fileName, description, rated, trailerLink, language, time, filmStatus: filmStatus }
        const film = await Film.create(filmObject)
        if (film) {
            res.status(201).json({ message: `New Film ${film.filmName} created` })
        } else {
            res.status(400).json({ message: 'Invalid Film data received' })
        }
    })
})

// @desc Update a film
// @route PATCH /films
// @access Private

const updateFilm = asyncHandler(async (req, res) => {
    const form = formidable()
    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
            return;
        }
        const { filmId, directors, actors, tags, premiereDay, filmName, description, time, language, filmStatus } = fields
        if (!filmId || !directors || !actors || !tags || !premiereDay || !filmName || !description || !rated || !trailerLink || !language || !time || !filmStatus) {
            saveFileErr = "All field are required "
            return res.status(400).json({ message: 'All field are required' })
        }
        const film = await Film.findById(filmId).exec()
        if (!film) {
            return res.status(400).json({ message: 'Film not found' })
        }

        const directorsList = directors.split(",").map((item) => item.trim())
        const actorsList = actors.split(",").map((item) => item.trim())
        const tagsList = tags.split(",").map((item) => item.trim())
        if ([directorsList, actorsList, tagsList].every(item => !item.length && !Array.isArray(item))) {
            return res.status(400).json({ message: 'Body contents invalid fields' })
        }
        var saveFileErr
        if (files?.poster) {
            var oldpath = files.poster.filepath;
            var split = files.poster.originalFilename.split(".")
            var fileEx = split[split.length - 1]
            var fileName = `poster-${randomUUID()}.${fileEx}`
            var newpath = path.join(__dirname, "..", "public", fileName)

            fs.rm(path.join(__dirname, "..", "public", film.poster), (err) => {
                if (err && !saveFileErr) {
                    console.log("er")
                    res.status(501).json({ err: "cannot save file" })
                    saveFileErr = err
                    return
                }
                fs.copyFile(oldpath, newpath, function (err) {
                    if (err && !saveFileErr) {
                        console.log("er")
                        res.status(501).json({ err: "cannot save file" })
                        saveFileErr = err
                        return
                    }
                });
            })
            film.poster = fileName
        }
        if (saveFileErr) return;
        film.filmName = filmName
        film.description = description
        film.actors = actorsList
        film.directors = directors
        film.tags = tagsList
        film.premiereDay = premiereDay
        film.rated = rated
        film.trailerLink = trailerLink
        film.language = language
        film.time = time
        film.filmStatus = filmStatus
        const updatedFilm = await film.save()
        if (updatedFilm) {
            res.status(201).json({ message: `${film.filmName} updated` })
        } else {
            res.status(400).json({ message: 'Invalid Film data received' })
        }
    })
})

// @desc Delete a film
// @route DELETE /films
// @access Private
const deleteFilm = asyncHandler(async (req, res) => {
    const { id } = req.body
    console.log(req.body)
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    const film = await Film.findById(id).exec()

    if (!film) {
        return res.status(400).json({ message: 'User not found' })
    }



    const result = await film.deleteOne()
    const filePath = path.join(__dirname, "..", "public", film.poster)
    fs.stat(filePath, function (err, stats) {
        console.log(stats);//here we got all information of file in stats variable

        if (err) {
            return console.error(err);
        }

        fs.unlink(filePath, function (err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
        });
    });

    const reply = `Username ${result.filmName} with ID ${result._id} deleted`

    res.json(reply)
})
module.exports = {
    getAllFilms,
    createNewFilm,
    updateFilm,
    deleteFilm,
}