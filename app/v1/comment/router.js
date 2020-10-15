const router = require('express').Router()

const controller = require('./controller.js')

router.delete(`/:id`, controller.deleteComment)

module.exports = router
