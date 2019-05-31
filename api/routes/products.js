const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')
const productsController = require('../controllers/products')


router.get('/', productsController.products_get_all);
router.post('/',productsController.upload.single('productImage'), checkAuth, productsController.products_post_new);
router.get('/:productId', productsController.products_get_single);
router.patch('/:productId', checkAuth, productsController.products_patch);
router.delete('/:productId', checkAuth, productsController.products_delete_single);

module.exports = router;