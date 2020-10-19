const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorsController = require("./controllers/errors");
const sequelize = require("./utility/database");
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


const app = express();

// set() is a method for a global configuration value
// details https://expressjs.com/en/4x/api.html#app.set
app.set("view engine", "ejs");
// path where to find this templates, second argument is our directory
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRouter = require("./routes/shop");

// to be able parse request body
//request.body
app.use(bodyParser.urlencoded({ extended: false }));


// a middleware for to store the user in request to use it anywhere in the app conveniently
app.use( (request, response, next) => {
    User.findByPk(1)
        .then( user => {
            request.user = user;

            // call the next() to continue with the next step if we get our user in the store
            next();
        })
        .catch( err => console.log(err));
});

// to serve files statically it means not handled by the express router
// or other middleware but instead directly forwarder to the file system
// for this we use static() which serves static files through the new middleware app.use()
app.use(express.static(path.join(__dirname, "public")));

// the same as http://localhost:3000/admin
app.use("/admin", adminRoutes);

app.use(shopRouter);

// we don't use path because it by default
app.use(errorsController.get404);

// defining an Association (or relations or connections)\
// in database products table we can see new field/column userId related to the user's id
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});



// hook up sequelize
// sync() method has to look at all models that were defined and then creates tables for them,
// it syncs your models to the database by creating appropriate tables and if you have the relations
// config {force: true} is to overwrite existing table in database
sequelize
    // .sync({force: true})
    .sync()
    // manually user authentication
    .then( result => {

        return User.findByPk(1);
        // console.log(result);

    })
    .then( user => {

        // if user doesn't exist then create new one
        if (!user) {
            return User.create({ name: 'Voyager', email: 'test@test.com' });
        }

        return user;
    })
    .then( user => {
        console.log(user);

        return user.createCart();

    })
    .then( cart => {

        app.listen(3000);
    })
    .catch( err => {
        console.log(err)
    });

