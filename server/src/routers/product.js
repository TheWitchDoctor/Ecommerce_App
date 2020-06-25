const express = require('express')
const {auth, authAdmin}  = require('../middleware/auth.js')
const router = new express.Router()
const { 
    addNewProduct,
    readProducts,
    readProductById,
    updateProduct,
    deleteProductById
} = require('../controllers/productController')


// *Add Product
router.post('/api/products/add', authAdmin, addNewProduct)


// * Read Products and filter by title, category, InStock & sort by price, quantity, title
router.get('/api/products', readProducts)


// *Read Product by ID
router.get('/api/products/:id', authAdmin, readProductById)


// *Update Product by ID
router.patch('/api/products/:id', authAdmin, updateProduct)


// *Delete Product by ID
router.delete('/api/products/:id', authAdmin, deleteProductById)

module.exports = router