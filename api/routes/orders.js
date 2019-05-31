const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const OrdersControllers = require('../controllers/orders');

router.get('/', checkAuth, OrdersControllers.order_get_all)
router.post('/', checkAuth, OrdersControllers.order_post_new)
router.get('/:orderId', checkAuth, OrdersControllers.order_get_order_details)
router.delete('/:orderId', checkAuth, OrdersControllers.order_delete)

module.exports = router;