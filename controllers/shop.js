// by convention name of imported class names with capital letter
const Product = require('../models/product');


exports.getProducts = (request, response, next) => {

    Product.findAll()
        .then( products => {

            response.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch( err => console.log(err));
}


exports.getProduct = (request, response, next) => {

    const prodId = request.params.productId;

    Product.findByPk(prodId)
        .then( (product ) => {

            response.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch( err => console.log(err));

    // alternative way
    /*
        Product.findAll({
            where: {id: prodId}
        }).then( (products ) => {

            response.render('shop/product-detail', {
                product: products[0],
                pageTitle: products[0].title,
                path: '/products'
            });
        })
            .catch( err => console.log(err));
     */

}

exports.getIndex = (request, response, next) => {

    Product.findAll()
        .then( products => {

            response.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch( err => console.log(err))

};

exports.getCart = (request, response, next) => {

    request.user.getCart()
        .then( cart => {
            console.log(cart);

            return cart.getProducts()
                .then( products => {
                    response.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products: products
                    });
                })
                .catch( err => console.log(err));
        })
        .catch( err => console.log(err));

}


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(prodId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (request, response, next) => {

    const prodId = request.body.productId;

    request.user.getCart()
        .then( cart => {
            return cart.getProducts( {where: {id: prodId}});
        })
        .then( products => {
            const product = products[0];

            return product.cartItem.destroy();
        })
        .then( result => {
            response.redirect('/cart');
        })
        .catch( err => console.log(err));

}

exports.postOrder = (request, response, next) => {

    let fetchedCart;

    request.user.getCart()
        .then( cart => {

            fetchedCart = cart;

            return cart.getProducts();
        })
        .then(products => {

            return request.user.createOrder()
                .then( order => {
                    return order.addProducts(
                        products.map(product => {
                            //the property has to be the name defined in the order-item model
                            product.orderItem = { quantity: product.cartItem.quantity }
                            return product;
                        })
                    );
                })
                .then(result => {

                    return fetchedCart.setProducts(null);

                }).then(result => {

                    response.redirect('/orders');
                })
                .catch( err => console.log(err))
        })
        .catch( err => console.log(err));

}


exports.getOrders = (request, response, next) => {

    request.user.getOrders({include: ['products']})
        .then( orders => {
            response.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch( err => console.log(err))

}


















