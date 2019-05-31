const mongoose = require('mongoose')
const Product = require('../models/products');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-')+file.originalname);
    }
});

const fileFilter =  (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype  === 'image/png'){
        cb(null, true);
    }else {
        cb(new Error('File format not supported'));
    }
};

exports.upload = multer({storage: storage ,
    limits: {
    fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
}

exports.products_post_new = (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
    .save()
    .then(result => {
        console.log(result)
        res.status(201).json({
            message: 'product Created',
            product: product
        });
    })
    .catch(err => {
        console.log(err)
            res.status(500).json({
                error: err
            })
    })
}

exports.products_get_single = (req, res, next) => {
    const id =  req.params.productId;
    Product.findById({_id: id})
    .exec()
    .then(doc => {
        console.log(doc)
        if (doc){
          return  res.status(200).json(doc);
        }
        return res.status(404).json({
            message: 'The Product is not found'
        })
    
        
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })  
}

exports.products_patch = (req, res, next) => {
    const id = req.params.productId;
    const update = {};
    for (const ops of req.body){
        update[ops.propsName] = ops.value
    }
    Product.update({_id: id}, {$set: update})
    .exec()
    .then(result => {
        console.log(result)
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.products_delete_single = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        res.status(500).json(err)
    })
}