const mongoose = require('mongoose')
const validator = require('validator')

const productSchema = new mongoose.Schema({
    _id:{
        type: String,
        required:true,
        lowercase: true
    },
    title: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    price: {
        type: mongoose.Decimal128,
        required: true
    },
    quantity: {
        type: Number,
        required: true
        //ref: 'User'
    },
    category: {
        type: String,
        required: true,
        lowercase: true
    },
    size: {
        type: String
    },
    InStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)


module.exports = Product