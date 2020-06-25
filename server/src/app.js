const express = require('express')
const path = require('path')
require('./db/mongoose.js')


const userRouter = require('./routers/user.js')
const productRouter = require('./routers/product.js')
const indexRouter = require('./routers/index')

const publicDir = path.join(__dirname, '../public')

const app = express()


app.use(express.static(publicDir))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH')
    next();
});

app.use(express.json())
app.use(userRouter)
app.use(productRouter)
app.use(indexRouter)

module.exports = app
