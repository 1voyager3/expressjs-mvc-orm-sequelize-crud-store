// by convention name of imported class names with capital letter
const Product = require('../models/product')

exports.getAddProduct = (request, response, next) => {

    response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        // for dynamic active effect in nav menu for Add product
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddproduct = (request, response, next) => {

    const title = request.body.title;
    const imageUrl = request.body.imageUrl;
    const price = request.body.price;
    const description = request.body.description;

    // this is an automatic Sequelize method of manually setting the user Association (userId) to the product
    // it doesn't work
    request.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
    }).then( result => {
        console.log('Created product');

        response.redirect('/admin/products');
    })
        .catch( err => {
            console.log(err);
        });

    //    alternative way of manually setting the user Association (userId) to the product
    /*
    Product.create({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
    //    alternative way of manually setting the user Association (userId) to the product
        userId: request.user.id
    })
        .then( result => {
            console.log('Created product');

            response.redirect('/admin/products');
        })
        .catch( err => {
            console.log(err);
        })
     */

}

exports.getEditProduct = (request, response, next) => {

    const editMode = request.query.edit;

    if (!editMode) {
        return response.redirect('/');
    }

    //params property is from router.get('/edit-product/:productId', adminController.getEditProduct)
    // located in controllers/admin.js
    // :productId is a value of params property
    const prodId = request.params.productId;

    request.user.getProducts({where: {id: prodId}})
    //    alternative way but only with only product callback in then() method
    // Product.findByPk( prodId)
        .then( products => {

            const product = products[0];

            if (!product) {
                return response.redirect('/');
            }

        response.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    }).catch( err => {
        console.log(err)
    })
};


exports.postEditProduct = (request, response, next) => {
    const prodId = request.body.productId;
    const updatedTitle = request.body.title;
    const updatedPrice = request.body.price;
    const updatedImageUrl = request.body.imageUrl;
    const updatedDesc = request.body.description;

    Product.findByPk(prodId)
        .then( product => {

            // here are updating the product locally in JS environment
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;

            // here are saving in our database
            return product.save();
            })
        // this result handles successful response of product.save()
        .then( result => {
            console.log('UPDATED PRODUCT!');

            response.redirect('/admin/products');
        })
        .catch( err => console.log(err));

}


exports.getProducts = (request, response, next) => {

    request.user.getProducts()
        .then( products => {

            response.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch( err => console.log(err));

}

exports.postDeleteProduct = (request, response, next) => {

    const prodId = request.body.productId;

    Product.findByPk(prodId)
        .then( product => {
            return product.destroy();
        })
        .then( result => {
            console.log(`DELETED PRODUCT WITH ID ${prodId}`);

            response.redirect('/admin/products');
        })
        .catch( err => console.log(err));

}

















