const mongoose = require('mongoose');
const Order = require('../models/orders');
const Product = require('../models/products')

exports.order_get_all = (req, res, next)=>{
    Order.find()
    .populate('product', 'name')
    .select('product quantity _id')
    .exec()
    .then(docs => {
        const result = {
            count: docs.length,
            order: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json(err)
    })
   
}
exports.order_post_new = (req, res, next)=>{
    Product.findById(req.body.productId)
    .then(product => {
        if(!product){
            return res.status(500).json({
                message: 'Product not found'
            })
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
    
        });
        return order.save()
    })
    .then(result => {
        res.status(201).json({
        message: 'order was created',
        createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity
        },
        request: {
            type: 'GET',
            url: 'http://localhost:3000/orders' + result._id
        }
        })
    })
    .catch(err => {
        res.status(500).json(err)
    });
    
    
}
exports.order_get_order_details = (req, res, next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        if (!order) {
            return res.status(404).json({
                message: 'order not found'
            })
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            err: err
        })
    })
}

exports.order_delete = (req, res, next)=>{
    Order.deleteOne({_id: req.params.orderId})
    .exec()
    .then(order => {
        res.status(200).json({
            message: 'Deleted Succesfully',
            request: {
                type: 'POST',
                url: 'http://localhost/orders',
                body: { productId: 'ID', quantity: 'NUMBER'}
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            message: "An error occur",
            err: err
        })
    })

}