const router = require('express').Router()

const controller = require('./controller.js')
const commentRouter = require('./comment/router.js')

router.get('/', controller.getAll)
router.get('/:id', controller.getById)
router.post('/', controller.createArticle)
router.put('/:id', controller.updateArticle)
router.delete('/:id', controller.deleteArticle)
router.use(commentRouter)

module.exports = router
