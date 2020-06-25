const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Product = require('../../src/models/product')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: { firstName:'Jack', lastName: "Black" },
    email: 'Leon@example.com',
    contact: 1212121212,
    address: {
      city: "Mumbai",
      streetName: "Bandra East",
      houseNo: "31-N near Church"
    },
    orders: [],
    cart: {
      products: [{
          _id: "product_2",
          quantity: 5
        },
        {
          _id: "product_1",
          quantity: 3
        }
      ],
      total: 3.72
    },
    pass: '77what!!',
    tokens: [{
        token: jwt.sign({
            _id: userOneId
        }, process.env.JWT_SECRET_KEY)
    }]
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: { firstName: "Tushar", lastName: "Bana" },
  age: 23,
  email: "tushar18@example.com",
  contact: 4747474747,
  address: {
    city: "Pune",
    streetName: "Camp Road",
    houseNo: "121-H near Cantt"
  },
  orders: [{
      date: "25 April 2020",
      amount: 14.27,
      products: [{
          _id: "product_7",
          quantity: 5
        },
        {
          _id: "product_4",
          quantity: 3
        }
      ]
    },
    {
      completed: true,
      date: "20 April 2020",
      amount: 17.27,
      products: [{
          _id: "product_7",
          quantity: 5
        },
        {
          _id: "product_4",
          quantity: 3
        }
      ]
    }
  ],
  cart: {
    products: [],
    total: 0
  },
  pass: "$$77tushar77$$",
  tokens: [
    {
      token: jwt.sign(
        {
          _id: userTwoId,
        },
        process.env.JWT_SECRET_KEY
      ),
    },
  ],
};

const userAdminId = new mongoose.Types.ObjectId();
const userAdmin = {
  _id: userAdminId,
  name: { firstName: "Tejas", lastName: "Verma" },
  role: "Admin",
  age: 30,
  email: "tejas@example.com",
  contact: 3434343434,
  address: {
    city: "Pune",
    streetName: "Magarpatta",
    houseNo: "505 Green Field Society"
  },
  orders: [],
  cart: {
    products: [],
    total: 0
  },
  pass: "tejas$$!!",
  tokens: [{
    token: jwt.sign({
        _id: userAdminId.toString(),
      },
      process.env.JWT_SECRET_KEY
    ),
  }, ],
};

const productOne = {
    _id: "product_1",
    title: 'Orange',
    category: "Fruits",
    price: 1.29,
    quantity: 12,
    size: "1 Dozen"

}

const productTwo = {
  _id: "product_2",
  title: 'Cream',
  category: "Dairy",
  price: 2.09,
  quantity: 8,
  size: "100 ml"

}

const productThree = {
  _id: "product_3",
  title: 'Mango',
  category: "Fruits",
  price: 1.57,
  quantity: 5,
  size: "1 dozen"

}

const setupDatabase = async () => {
    await User.deleteMany()
    await Product.deleteMany()
    await new User(userOne).save();
    await new User(userTwo).save();
    await new User(userAdmin).save();
    await new Product(productOne).save()
    await new Product(productTwo).save();
    await new Product(productThree).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    userAdminId,
    userAdmin,
    productOne,
    productTwo,
    productThree,
    setupDatabase
    
}
