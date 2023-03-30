const express = require('express')
const router = express.Router()
const filmController = require('../controllers/filmsController')
const verifyJWT = require('../middleware/verifyJWT')
router.route('/')
    .get(filmController.getAllFilms)
    .post(verifyJWT, filmController.createNewFilm)
    .patch(verifyJWT, filmController.updateFilm)
    .delete(verifyJWT, filmController.deleteFilm)

module.exports = router