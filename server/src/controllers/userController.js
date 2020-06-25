const User = require('../models/user')
const Product = require('../models/product')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const { update } = require('../models/user')
//const updateProduct = require('../index')

async function createUser(req, res){
    const user = new User(req.body)

    if(!parseInt(user.contact)) {
        return res.status(500).send({message:'Contact Should be a Number'})
    } else if(!parseInt(user.age)) {
        return res.status(500).send({message:'Age Should be a Number'})
    } else if(user.contact.length !== 10) {
        return res.status(500).send({message: 'Contact should be 10 digits'})
    } else if(parseInt(user.age) < 18 || parseInt(user.age) > 100) {
        return res.status(500).send({message:'Age should be between 18 and 100'})
    }

    if(user.role=="Admin"){
        if(user.pass === process.env.ADMIN_PASSWORD){
            console.log("Admin Password Verified")
        } else{
            return res.status(401).send("You are not authorized to create Admin User")
        }
    }

    if (user.pass === process.env.ADMIN_PASSWORD) {
        user.role = 'Admin'
        console.log("Admin Password Verified")
    }
            
    // *Using async and await
    try {
        await user.save()

        const token = await user.generateAuthToken()
        // res.cookie('token', token, {
        //     httpOnly: true
        // });

        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send({message: 'Email or Contact already Exists!'})
    }
}

async function deleteUserAvatar(req, res){
     req.user.avatar = undefined
     await req.user.save()
     res.send("Avatar Removed")
}

async function viewUserAvatar(req, res){
    const user = await User.findById(req.user._id)
    try {
        if (!user || !user.avatar) {
            throw new Error()
        }

        //res.set('Content-Type', 'image/png')
        //res.set('responseType', 'arraybuffer')
        var base64 = Buffer.from(user.avatar).toString('base64');
        base64 = 'data:image/png;base64,' + base64;
        res.send(base64)
    } catch (e) {
        console.log(e)
        res.status(404).send()
    }
}

async function loginUser(req, res){
    try {
        const user = await User.findByCredentials(req.body.email, req.body.pass)
        const token = await user.generateAuthToken()
        // res.cookie('token', token, {
        //     httpOnly: true
        // });
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send()
    }
}

async function logoutUser(req, res){
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("Logged Out")
    } catch (e) {
        res.status(500).send()
    }
}

async function logoutUserALL(req, res){
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Logged Out of All Devices")
    } catch (e) {
        res.status(500).send()
    }
}

async function updateUser(req, res){
    if(req.body.name.firstName === '' & req.body.name.lastName === ''){
        delete req.body.name
    } else {
        if (req.body.name.firstName === '') {
            req.body.name.firstName = req.user.name.firstName
        }
        if (req.body.name.lastName === '') {
            req.body.name.lastName = req.user.name.lastName
        }
    }

    if (req.body.email === '') {
        delete req.body.email
    }

    if (req.body.pass === '') {
        delete req.body.pass
    }

    if(req.body.age === '') {
        delete req.body.age
    } else {
        req.body.age = parseInt(req.body.age)
    }

    if(req.body.contact === '') {
        delete req.body.contact
    }

    if(req.body.address.houseNo === '' & req.body.address.streetName === '' & req.body.address.city === '') {
        delete req.body.address
    } else {
        if(req.body.address.houseNo === '') {
            req.body.address.houseNo = req.user.address.houseNo
        }
        if(req.body.address.streetName === '') {
            req.body.address.streetName = req.user.address.streetName
        }
        if(req.body.address.city === '') {
            req.body.address.city = req.user.address.city
        }
    }
    const allowedUpdates = ['name', 'email', 'pass', 'age', 'contact', 'address']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid Update Operation!"
        })
    }
    

    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        // ! findByIdAndUpdate can bypass middlewares
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        res.status(200).send(req.user)
    } catch (e) {
        if (e.name === 'CastError') {
            res.status(404).send('User not Found')
        }
        res.status(400).send(e)
    }
}

async function deleteUser(req, res){
    try {
        await req.user.remove()
        try {
            sendCancelEmail(req.user.email, req.user.name)
        } catch (e) {

        }

        res.status(200).send(req.user)
    } catch (e) {
        if (e.name === 'CastError') {
            return res.status(404).send('No such user found')
        }
        res.status(500).send(e)
    }
}

async function viewUserCart(req, res){
    //* check for price updates
    const products = req.user.cart.products
    var total = 0;
    var i;
    for (i = 0; i < products.length; i++) {
        var find = await Product.findById(products[i]._id).exec();
        total += (parseFloat(find.price) * products[i].quantity)

    }
    if (total !== req.user.cart.total) {
        req.user.cart.total = total
        await req.user.save()
    }
    let clientCart = {}
    await req.user.cart.products.forEach((prod) => clientCart[prod.title] = prod.quantity)
    let data = {
        cart: req.user.cart,
        clientCart: clientCart
    }
    res.send(data)
}

async function viewUserOrders(req, res){
    const match = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')

        if (parts[0] === 'amount') {
            if (parts[1] === 'desc') {
                req.user.orders = req.user.orders.sort(function (a, b) {
                    return b.amount - a.amount
                })
            } else {
                req.user.orders = req.user.orders.sort(function (a, b) {
                    return a.amount - b.amount
                })
            }
        } else if(parts[0] === 'date') {
            if (parts[1] === 'desc') {
                req.user.orders = req.user.orders.sort(function(a, b) {
                    let aDateTime = new Date(a.date)
                    let bDateTime = new Date(b.date)
                    return bDateTime - aDateTime
                })
            } else {
                req.user.orders = req.user.orders.sort(function(a, b) {
                    let aDateTime = new Date(a.date)
                    let bDateTime = new Date(b.date)
                    return aDateTime - bDateTime
                })
            }
        }

    }


    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
        const orders = req.user.orders.filter((order) => {
            return order.completed === match.completed
        })

        return res.send(orders)
    }

    res.send(req.user.orders)
}

async function userCartOperations(req, res){
    const product = await Product.findOne({title:req.body.productTitle})
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
            
        req.user = user
    } catch (e) {
        console.log('User not logged in')
    }

    if(req.user) {
        const matchIndex = req.user.cart.products.findIndex((prod) => {
            return prod._id === product._id
        })
        
        
        try {
            if (req.query.product === 'add') {

                // Check Product Availability
                if (product.quantity === 0) {
                    if (product.InStock !== false) {
                        product.InStock = false
                        await product.save()
                    }
                    return res.status(400).send('Product is out of Stock')
                }

                // Add available product to cart
                if (matchIndex === -1) {
                    req.user.cart.products.push({
                        "_id": product._id,
                        "title": product.title,
                        "quantity": 1
                    })

                } else {
                    req.user.cart.products[matchIndex].quantity++

                }
                if (!parseFloat(req.user.cart.total)) {
                    req.user.cart.total = product.price

                } else {
                    req.user.cart.total = parseFloat(req.user.cart.total) + parseFloat(product.price)
                }

                // Remove Product quantity from stock
                product.quantity--

            } else if (req.query.product === 'remove') {

                if (matchIndex === -1) {
                    return res.status(404).send()
                } else if (req.user.cart.products[matchIndex].quantity === 1) {
                    req.user.cart.products.splice(matchIndex, 1)
                } else {
                    req.user.cart.products[matchIndex].quantity--
                }

                if (!parseFloat(req.user.cart.total)) {
                    req.user.cart.total = 0.0

                } else {
                    req.user.cart.total = parseFloat(req.user.cart.total) - parseFloat(product.price)
                    if (parseFloat(req.user.cart.total) < 0.01) {
                        req.user.cart.total = 0.0
                    }
                }
                // Add Product quantity to stock
                if (product.InStock === false) {
                    product.InStock = true
                }
                product.quantity++
            } else if(req.query.product === 'delete') {
                
                if (!parseFloat(req.user.cart.total)) {
                    req.user.cart.total = 0.0

                } else {
                    req.user.cart.total = parseFloat(req.user.cart.total) - parseFloat(product.price * req.user.cart.products[matchIndex].quantity)
                    if (parseFloat(req.user.cart.total) < 0.01) {
                        req.user.cart.total = 0.0
                    }
                }
                product.quantity += req.user.cart.products[matchIndex].quantity
                req.user.cart.products.splice(matchIndex, 1)
            }

            await product.save()
            await req.user.save()
            
            res.status(200).send(req.user.cart)
        } catch (e) {

            res.status(400).send(e)
        }

    } else {
        if (req.query.product === 'add') {
            if (product.quantity === 0) {
                if (product.InStock !== false) {
                    product.InStock = false
                    await product.save()
                }
                return res.status(400).send('Product is out of Stock')
            }
            product.quantity--

        } else if (req.query.product === 'remove') {
            // Add Product quantity to stock
            if (product.InStock === false) {
                product.InStock = true
            }
            product.quantity++
        
        }

        await product.save()
        
        res.status(200).send('Product Updated')
    }
}


async function placeNewOrder(req, res){
    if (req.user.cart.products !== []) {
        await req.user.orders.push({
            "products": req.user.cart.products,
            "amount": parseFloat(req.user.cart.total).toFixed(2),
            "date": moment().format('YYYY-MM-DD') + ' ' + moment().format('h:mm A'),
            "shippingAddress": req.user.address.houseNo + ' ' + req.user.address.streetName + ' ' + req.user.address.city
        })

        req.user.cart.products = []
        req.user.cart.total = 0.0
        await req.user.save()

    } else {
        return res.status(400).send({
            Error: 'No Products in Cart. Add products to cart to place order.'
        })
    }

    res.status(200).send("Your order has been placed Successfully!! Kindly note the orderID - " + req.user.orders[req.user.orders.length - 1]._id)
}

async function setOrderDelivered(req, res){
    const order = await req.user.orders.find(ord => ord._id.toString() === req.params.id)
    try {
        order.completed = true
        await req.user.save()
        res.status(200).send(order)
    } catch (e) {
        res.status(400).send(e)
    }
}

async function updateUserCart(req, res) {
    if(req.body.update === 'login'){
        
        for await (var key of req.body.cart){
            
            let product = await Product.findOne({title:key.product})
            
            let matchIndex = await req.user.cart.products.findIndex((prod) => {
                return prod.title === key.product
            })
            

            if(matchIndex === -1){
                await req.user.cart.products.push({
                    "_id": product._id,
                    "title": product.title,
                    "quantity": key.quantity
                })
                
            } else {
                req.user.cart.products[matchIndex].quantity += key.quantity
            }
            
            if (!parseFloat(req.user.cart.total)) {
                req.user.cart.total = (product.price * key.quantity)

            } else {
                req.user.cart.total = parseFloat(req.user.cart.total) + parseFloat(product.price * key.quantity)
            }
            

        }
    }
    await req.user.save()
    
    return res.status(200).send(req.user.cart)
}


async function adminViewUsers(req, res){
    const sort = {}
    const match = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')

        if (parts[1] === 'desc') {
            sort[parts[0]] = -1

        } else {
            sort[parts[0]] = 1
        }
    }

    if (req.query.city) {
        match['address.city'] = req.query.city
    }
    if (req.query.role) {
        match.role = req.query.role
    }
    if (req.query.age) {
        const parts = req.query.age.split(':')
        if (parts[0] === 'eq') {
            match.age = parts[1]
        } else if (parts[0] === 'gt') {
            match.age = {}
            match.age['$gt'] = parts[1]
        } else if (parts[0] === 'lt') {
            match.age = {}
            match.age['$lt'] = parts[1]
        }
    }
    if (req.query.fname) {
        match['name.firstName'] = req.query.fname
    }
    if (req.query.lname) {
        match['name.lastName'] = req.query.lname
    }
    if (req.query.email) {
        match.email = req.query.email
    }
    if (req.query.contact) {
        match.contact = req.query.contact
    }
    if (req.query.cart) {
        const parts = req.query.cart.split(':')
        if (parts[0] === 'products' & parts[1] === 'empty') {
            match['cart.products'] = []
            match['cart.total'] = 0
        } else if (parts[0] === 'products') {
            match['cart.products._id'] = parts[1]
        } else if (parts[0] === 'total') {
            const parts1 = parts[1].split('_')
            if (parts1[0] === 'eq') {
                match['cart.total'] = parts1[1]
            } else if (parts1[0] === 'gt') {
                match['cart.total'] = {
                    '$gt': parts1[1]
                }
            } else if (parts1[0] === 'lt') {
                match['cart.total'] = {
                    '$lt': parts1[1]
                }
            }
        }
    }
    if (req.query.orders) {
        const parts = req.query.orders.split(':')
        if (parts[0] === 'products') {
            match['orders.products._id'] = parts[1]
        } else if (parts[0] === 'completed') {
            match['orders.completed'] = parts[1]
        } else if (parts[0] === 'date') {
            match['orders.date'] = parts[1]
        } else if (parts[0] === 'amount') {
            const parts1 = parts[1].split('_')
            if (parts1[0] === 'eq') {
                match['orders.amount'] = parts1[1]
            } else if (parts1[0] === 'gt') {
                match['orders.amount'] = {
                    '$gt': parts1[1]
                }
            } else if (parts1[0] === 'lt') {
                match['orders.amount'] = {
                    '$lt': parts1[1]
                }
            }
        }
    }

    users = await User.find(match).sort(sort)

    try {
        res.status(200).send(users)
    } catch (e) {
        res.status(500).send(e)
    }
}

async function adminUpdateUserCart(req, res){
    const allowedUpdates = ['cart']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid Update Operation!"
        })
    }

    const user = await User.findById(req.params.id).exec()
    try {
        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        // ! findByIdAndUpdate can bypass middlewares
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        res.status(200).send(user)
    } catch (e) {
        if (e.name === 'CastError') {
            res.status(404).send('User not Found')
        }
        res.status(400).send(e)
    }
}

async function adminUpdateUserOrders(req, res){
    const allowedUpdates = ['orders']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid Update Operation!"
        })
    }

    const user = await User.findById(req.params.id).exec()
    try {
        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        // ! findByIdAndUpdate can bypass middlewares
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        res.status(200).send(user)
    } catch (e) {
        console.log(e)
        if (e.name === 'CastError') {
            res.status(404).send('User not Found')
        }
        res.status(400).send(e)
    }
}

module.exports = {
    createUser,
    deleteUserAvatar,
    viewUserAvatar,
    loginUser,
    logoutUser,
    logoutUserALL,
    updateUser,
    deleteUser,
    viewUserCart,
    viewUserOrders,
    userCartOperations,
    placeNewOrder,
    setOrderDelivered,
    updateUserCart,
    adminViewUsers,
    adminUpdateUserCart,
    adminUpdateUserOrders
}