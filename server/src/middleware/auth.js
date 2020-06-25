const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user){
            throw new Error()
        }
        if(user.role == 'Customer') {
            req.customer = true
        } else if(user.role == 'Admin') {
            req.admin = true
        } 
        req.token = token
        req.user = user
        next()
    }catch(e){
        res.status(401).send({ error: "Please authenticate" })
    }
}

const authAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({
            _id: decoded._id,
            role: 'Admin',
            'tokens.token': token
        })
        if (!user) {
            throw new Error('Only Admin can add Products!')
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({
            error: "Please authenticate as Admin"
        })
    }
}


module.exports = {auth, authAdmin}