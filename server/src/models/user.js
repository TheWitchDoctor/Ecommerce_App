const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



const userSchema = new mongoose.Schema({
    name: {
        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        }
    },
    email: {
        required: true,
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    pass: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("This is a weak password. Cannot contain 'password'");
            }
        }

    },
    role: {
        type: String,
        default: 'Customer'
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive Number!')
            }
        }
    },
    contact: {
        type: String,
        unique: true,
        required: true
    },
    address: {
        streetName: {
            type: String,
            required: true
        },
        city: {
            type: String,
            trim: true,
            required: true
        },
        houseNo: {
            type: String,
            required: true
        }
    },
    orders: [{
        completed: {
            type: Boolean,
            default: false
        },
        date: {
            type: String
        },
        amount: {
            type: mongoose.Decimal128
        },
        shippingAddress: {
            type: String
        },
        products: [{
            _id: {
                type: String,
                ref: 'Product'
            },
            title: {
                type: String
            },
            quantity: {
                type: Number
            }

        }]
    }],
    cart: {
        products: [{
            _id: {
                type: String,
                ref: 'Product'
            },
            title: {
                type: String
            },
            quantity: {
                type: Number
            }

        }],
        total: {
            type: mongoose.Decimal128
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// *Virtual Property (used for reference)
userSchema.virtual('cartProducts', {
    ref: 'Product',
    localField: 'cart.products.product_id',
    foreignField: '_id'
})

userSchema.virtual('orderProducts', {
    ref: 'Product',
    localField: 'orders.products.product_id',
    foreignField: '_id'
})

// *Auth Token for user instance
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: '2h'
    })

    user.tokens = user.tokens.concat({
        token
    })
    await user.save()
    setTimeout(() => {
        user.terminateAuthToken(user._id, token)
    }, 2*60*60*1000);

    return token
}

userSchema.methods.terminateAuthToken = async function (userId, token) {
    const user = await User.findById(userId).exec();
    user.tokens = user.tokens.filter(tok => tok.token !== token)
    await user.save()

}

// *Hiding confidential data
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.pass
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// *Login function
userSchema.statics.findByCredentials = async (email, pass) => {
    const user = await User.findOne({
        email
    })

    if (!user) {
        throw new Error('Unable to login. Wrong Credentials!')
    }

    const isMatch = await bcrypt.compare(pass, user.pass)

    if (!isMatch) {
        throw new Error('Unable to Login. Wrong Credentials!')
    }

    return user
}


// *Hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('pass')) {
        user.pass = await bcrypt.hash(user.pass, 8)
    }

    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User