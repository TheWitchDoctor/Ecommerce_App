const Product = require('../models/product')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

async function addNewProduct(req, res){
    const allowedCategory = ['fruits', 'dairy', 'bread', 'seasonings and spices', 'vegetables']
    const category = req.body.category.toLowerCase()

    const isValidOperation = allowedCategory.includes(category)
    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid Category Name!"
        })
    }
    const product = new Product({
        ...req.body
    })
    const lastProduct = await Product.findOne().sort({
        $natural: -1
    }).exec()

    if (!lastProduct) {
        product._id = 'product_1'
    } else {
        product._id = 'product_' + (parseInt(lastProduct._id.split('_')[1]) + 1).toString()
    }

    // *Using async and await
    try {
        await product.save()
        res.status(201).send(product)
    } catch (e) {
        res.status(400).send(e)
    }
}

async function readProducts(req, res){
    const match = {}
    const sort = {}

    req.customer = true
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        
        if(user.role == 'Admin'){
            req.customer = false
        }
    } catch(e) {
    }

    
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')

        if (parts[1] === 'desc') {
            sort[parts[0]] = -1

        } else {
            sort[parts[0]] = 1
        }
    }

    if (req.query.category) {
        match.category = req.query.category
    }
    if (req.query.InStock) {
        match.InStock = req.query.InStock
    }
    if (req.query.title) {
        match.title = req.query.title
    }

    products = await Product.find(match).sort(sort)
    if(products.length == 0){
        res.status(404).send("No Products Found")
    }else if(req.customer == true){
        var newProducts= []
        await products.forEach((product) => {
            newProducts.push({"title": product.title, "price":product.price, "quantityInStock":product.quantity, "category":product.category, "size":product.size})
        })
        
        return res.status(200).send(newProducts)
    }
    try {
        
        res.status(200).send(products)
    } catch (e) {
        res.status(404).send(e)
    }

}

async function readProductById(req, res){
    const _id = req.params.id

    // *Using asycn and await
    try {
        //const task = await Task.findById(_id)
        const product = await Product.findOne({
            _id
        })

        if (!product) {
            return res.status(404).send()
        }
        res.status(200).send(product)
    } catch (e) {
        if (e.name === 'CastError') {
            res.status(404).send('Product not Found')
        }
        res.status(500).send(e)
    }
}

async function updateProduct(req, res){
    const allowedUpdates = ['title', 'price', 'quantity', 'category', 'size', 'InStock']
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

        const product = await Product.findOne({
            _id: req.params.id
        })

        updates.forEach((update) => product[update] = req.body[update])


        if ('InStock' in req.body) {
            if (req.body.InStock.toString() === 'false') {
                product.quantity = 0
            }
        }

        await product.save()

        // !findByIdAndUpdate can bypass middleware functions

        if (!product) {
            return res.status(404).send('Product Not Found')
        }
        res.status(200).send(product)
    } catch (e) {
        if (e.name === 'CastError') {
            res.status(404).send('Product not Found')
        }
        res.status(400).send(e)
        console.log(e)
    }
}

async function deleteProductById(req, res){
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id
        })

        if (!product) {
            return res.status(404).send()
        }
        res.status(200).send(product._id + ' titled: ' + product.title + ' has been deleted Successfully!')
    } catch (e) {
        if (e.name === 'CastError') {
            return res.status(404).send('No such Product found')
        }
        res.status(500).send(e)
    }
}

module.exports = {
    addNewProduct,
    readProducts,
    readProductById,
    updateProduct,
    deleteProductById
}