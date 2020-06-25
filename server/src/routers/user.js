const express = require('express')
const router = new express.Router()
const {auth, authAdmin} = require('../middleware/auth.js')
const { createUser,
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
} = require('../controllers/userController')


// *Create User
router.post('/api/users', createUser)

// *Delete User Avatar
router.delete('/api/users/me/avatar', auth, deleteUserAvatar)

// *View User Avatar
router.get('/api/users/me/viewAvatar', auth, viewUserAvatar)


// *Login User
router.post('/api/users/login', loginUser)


// *Logout User
router.post('/api/users/logout', auth, logoutUser)


// *LogoutALL devices User
router.post('/api/users/logoutALL', auth, logoutUserALL)


// *Read User Profile
router.get('/api/users/me', auth, async (req, res) => {
    res.send(req.user)
})


// *Update User Personal Info
router.patch('/api/users/me', auth, updateUser)


// *Delete User
router.delete('/api/users/me', auth, deleteUser)


// *View user Cart
router.get('/api/users/me/cart', auth, viewUserCart)

// *View user Orders
router.get('/api/users/me/orders', auth, viewUserOrders)


// *Add/Remove Items in user Cart
router.post('/api/users/cart', userCartOperations)

// *Place New Order
router.post('/api/users/orders', auth, placeNewOrder)

// *When an order is delivered set completed to true
router.post('/api/users/orders/:id', auth, setOrderDelivered)


// *Upload User Avatar
const multer = require('multer')
const sharp = require('sharp')
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload only image file'))
        }
        cb(undefined, true)
    }
})


router.post('/api/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    let buffer = ''
    if(req.file){
        buffer = await sharp(req.file.buffer).resize({
            width: 250,
            height: 250
        }).png().toBuffer()
    }


    req.user.avatar = buffer
    
    await req.user.save()
    res.send("Avatar Uploaded Successfully!")
}, (error, req, res, next) => {
    res.status(400).send({
        Error: 'Please upload only Image File'
    })
})

// *Update User Cart
router.post('/api/users/me/updateCart', auth, updateUserCart)


// *ADMIN FUNCTIONS

// *View Users and filter by city, name, age, cart, orders, role, contact, email
router.get('/api/users/read', authAdmin, adminViewUsers)

// *Admin Update User Cart by ID
router.patch('/api/users/:id/cart/update', authAdmin, adminUpdateUserCart)

// *Admin Update User Orders by ID
router.patch('/api/users/:id/orders/update', authAdmin, adminUpdateUserOrders)


module.exports = router