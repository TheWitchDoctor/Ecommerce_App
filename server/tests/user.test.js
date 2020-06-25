const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, userTwoId, userTwo, taskOne, taskTwo, taskThree, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

// afterEach(() => { })

test('Should signup a new User', async () => {
    const response = await request(app).post('/api/users').send({
        name: {
            firstName: "Saloni",
            lastName: "D"
        },
        email: "saloni@gmail.com",
        pass: "saloni12345$!$!",
        age: 23,
        contact: 7777777777,
        address: {
            streetName: "Sinhgad Road",
            city: "Pune",
            houseNo: "C-11, near Sai Mandir"
        },
        orders: [],
        cart: {
            products: [],
            total: 0.0
        }
    }).expect(201)

    // Assert that database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assetions about the response
    expect(response.body).toMatchObject({
        user: {
            name: { firstName:'Saloni', lastName: 'D' },
            email: 'saloni@gmail.com',
            contact: 7777777777,
            age: 23
        },
        token: user.tokens[0].token
    })

    // Assert plain text password is not stored
    expect(user.pass).not.toBe('saloni12345$!$!')
})


test('Should not signup Admin User without right Admin Password', async () => {
    const response = await request(app).post('/api/users').send({
        name: {
            firstName: "Jake",
            lastName: "B"
        },
        email: "jake@gmail.com",
        role: "Admin",
        pass: "jake12345$!$!", //* Should match ADMIN_PASSWORD in test.env
        age: 23,
        contact: 7777777777,
        address: {
            streetName: "Sinhgad Road",
            city: "Pune",
            houseNo: "C-11, near Sai Mandir"
        },
        orders: [],
        cart: {
            products: [],
            total: 0.0
        }
    }).expect(401)

})



test('Should login existing user', async () => {
    const response = await request(app).post('/api/users/login').send({
        email: userOne.email,
        pass: userOne.pass
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existent user OR user with wrong credentials', async () => {
    await request(app).post('/api/users/login').send({
        email: userOne.email,
        pass: 'sssss$$1!!'
    }).expect(400)

    await request(app).post('/api/users/login').send({
        email: "anand@example.com",
        pass: 'saloni12345$!$!'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/api/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/api/users/me')
    .send()
    .expect(401)
})

test('Should delete account for authenticated user upon request', async () => {
    await request(app)
    .delete('/api/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should NOT delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/api/users/me')
        .send()
        .expect(401)
})


test('Should upload avatar image for authenticated user', async () => {
    await request(app)
    .post('/api/users/me/avatar')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields for authenticated user', async () => {
    await request(app)
    .patch('/api/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send({
        name: {
            firstName: "Tushaar",
            lastName: "Avlok Bana"
        },
        contact: 7979797979,
        address: {
            streetName: "Alandi Road",
            city: "Pune",
            houseNo: "77A"
        },
        email: "tushar@gmail.com",
        pass: "tushar12345$$!!",
        age: 24
    }).expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.email).toEqual('tushar@gmail.com')
    expect(user.name.firstName).toEqual('Tushaar') 
})

test('Should not update invalid fields', async () => {
    await request(app)
    .patch('/api/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send({
        location: 'Pune'
    })
    .expect(400)

    await request(app)
        .patch('/api/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            role: 'Admin'
        })
        .expect(400)
})