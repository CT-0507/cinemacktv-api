const express = require('express')
const router = express.Router()
const cinemaController = require('../controllers/cinemaController.js')
const verifyJWT = require('../middleware/verifyJWT')
router.route('/')
    .get(cinemaController.getAllCinemas)
    .post(verifyJWT, cinemaController.createNewCinema)
    // .patch(verifyJWT, cinemaController.updateFilm)
    .delete(verifyJWT, cinemaController.deleteCinema)

module.exports = router