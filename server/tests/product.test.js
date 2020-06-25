const request = require('supertest')
const Product = require('../src/models/product')
const app = require('../src/app')
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  userAdminId,
  userAdmin,
  productOne,
  productTwo,
  productThree,
  setupDatabase,
} = require("./fixtures/db");

beforeEach(setupDatabase)

test('Only Admin should be able to add new Product to Stock', async () => {
  const response = await request(app)
    .post("/api/products/add")
    .set("Authorization", "Bearer " + userAdmin.tokens[0].token)
    .send({
      "title": "Parmesan",
      "price": 1.39,
      "quantity": 7,
      "category": "Bread",
      "size": "12 Slices"
    })
    .expect(201)

  const product = await Product.findById(response.body._id)
  expect(product).not.toBeNull()
  //expect(task.completed).toEqual(false)
})

test('Customer should not be able add a new Product to Stock', async () => {
    const response = await request(app)
      .post("/api/products/add")
      .set("Authorization", "Bearer " + userOne.tokens[0].token)
      .send({
        "title": "Parmesan",
        "price": 1.39,
        "quantity": 7,
        "category": "Bread",
        "size": "12 Slices"
      })
      .expect(401)

      const product = await Product.findById(response.body._id)
      expect(product).toBeNull()
      //expect(task.completed).toEqual(false)
})

test('Everyone should be able to read products and filter by by title, category, InStock & sort by price, quantity, title', async () => {
    const response = await request(app)
      .get("/api/products?sortBy=price:asc&category=Fruits&InStock=true")
      .set("Authorization", "Bearer " + userTwo.tokens[0].token)
      .send()
      .expect(200)

})

test('Admin should be able to Delete & Update a Product from Stock', async () => {
    const response = await request(app)
      .patch("/api/products/" + productTwo._id)
      .set("Authorization", "Bearer " + userAdmin.tokens[0].token)
      .send({
        "title": "Potato",
        "category": "Vegetables",
        "quantity": 12,
        "size": "10 slices",
        "price": 0.89
      })
      .expect(200)

      const product = await Product.findById(productTwo._id)
      expect(product.title === 'Potato')


    const response1 = await request(app)
      .delete("/api/products/" + productTwo._id)
      .set("Authorization", "Bearer " + userAdmin.tokens[0].token)
      .send()
      .expect(200)

      const product1 = await Product.findById(productTwo._id)
      expect(product1).toBeNull()
})

test('Customer should NOT be able to Delete & Update a Product from Stock', async () => {
  const response = await request(app)
    .patch("/api/products/" + productTwo._id)
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send({
      "title": "Potato",
      "category": "Vegetables",
      "quantity": 12,
      "size": "10 slices",
      "price": 0.89
    })
    .expect(401)


  const response1 = await request(app)
    .delete("/api/products/" + productTwo._id)
    .set("Authorization", "Bearer " + userOne.tokens[0].token)
    .send()
    .expect(401)

})