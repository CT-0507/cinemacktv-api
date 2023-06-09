const express = require('express')
const router = express.Router()
const premiereSlotController = require('../controllers/premiereSlotController')
const verifyJWT = require('../middleware/verifyJWT')
router.route('/')
    .get(premiereSlotController.getAllPremiereSlot)
    .post(verifyJWT, premiereSlotController.createNewPremiereSlot)
    .patch(verifyJWT, premiereSlotController.updatePremiereSlot)
    .delete(verifyJWT, premiereSlotController.deletePremiereSlot)
module.exports = router