import * as actionTypes from './actionTypes'
import axios from '../../user-axios'
import {socket} from '../../App'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

export const setProducts = (products, sort, filter, search) => {
    return {
        type: actionTypes.SET_PRODUCTS,
        products: products,
        sort: sort,
        filter: filter,
        search: search
    }
}

export const setCart = (cart) => {
    return {
        type: actionTypes.SET_CART,
        cart: cart
    }
}

export const fetchProductsFailed = (error) => {
    return {
        type: actionTypes.FETCH_PRODUCTS_FAILED,
        error: error
    }
}

export const addProduct = (productTitle, productPrice) => {
    return {
        type: actionTypes.ADD_PRODUCT,
        productTitle: productTitle,
        productPrice: productPrice
    }
}


export const removeProduct = (productTitle, productPrice) => {
    return {
        type: actionTypes.REMOVE_PRODUCT,
        productTitle: productTitle,
        productPrice: productPrice
    }
}

export const deleteProduct = (product) => {
    return {
        type: actionTypes.DELETE_PRODUCT,
        productTitle: product.title,
        productPrice: product.price,
        productQuantity: product.quantity
    }
}

export const updateProduct = (product, update, Authorization) => {
    return dispatch => {
        axios.post('/api/users/cart?product='+update, {productTitle: product.title}, {
            headers: {
                Authorization: Authorization
            }
        }).then(res => {
            if(update==='add'){
                dispatch(addProduct(product.title, product.price))
            } else if(update==='remove'){
                dispatch(removeProduct(product.title, product.price))
            } else if(update==='delete') {
                dispatch(deleteProduct(product))
            }
            socket.emit("CartOperation")
        }).catch(e => {
            dispatch(fetchProductsFailed(e))
        })
    }
}

export const cartCheckState = () => {
    return dispatch => {
        let cart = cookies.get('cart')
        if (cart) {
            dispatch(setCart(cart));
        }
    }
}

export const initProducts = (filter, sort, search, Authorization) => {
    return dispatch => {
                axios.get('/api/products?' + sort + filter + search, {
                    headers: {
                        Authorization: Authorization
                    }
                })
                    .then(response => {
                        dispatch(setProducts(response.data, sort, filter, search));
                        
                    })
                    .catch(error => {
                        if(error.message==="Cannot read property 'data' of undefined"){
                            error.message = "Product Not Found"
                        }
                        dispatch(fetchProductsFailed(error));
                    })
    };
}

export const fetchUserCart = (Authorization) => {
    return dispatch => {
        dispatch(fetchCartStart())
        axios.get('/api/users/me/cart', {
            headers: {
                Authorization: Authorization
            }
        }).then(response => {
            dispatch(fetchCartSuccess(response.data))
            dispatch(cartCheckState())
        }).catch(e => {
            dispatch(fetchCartFail(e))
        })
    }
}


export const fetchCartSuccess = (cart) => {
    return {
        type: actionTypes.FETCH_CART_SUCCESS,
        cart: cart.cart,
        clientCart: cart.clientCart
    }
}

export const fetchCartFail = (e) => {
    return {
        type: actionTypes.FETCH_CART_FAIL,
        error: e
    }
}

export const fetchCartStart = () => {
    return {
        type: actionTypes.FETCH_CART_START
    }
}

export const userPlaceOrder = (Authorization) => {
    return dispatch => {
        dispatch(purchaseStart())
        axios.post('/api/users/orders', {}, {
            headers: {
                Authorization: Authorization
            }
        }).then(res => {
            console.log(res)
            dispatch(purchaseSuccess(res.data))
        }).catch(e => {
            if (e.message === 'Request failed with status code 400') {
                dispatch(purchaseFail('Cart is Empty! First Add products to Cart!'))
            } else {
                console.log(e)
            }
        })
    }
}

export const purchaseStart = () => {
    return {
        type: actionTypes.PURCHASE_START
    }
}

export const purchaseSuccess = (msg) => {
    return {
        type: actionTypes.PURCHASE_SUCCESS,
        msg: msg
    }
}

export const purchaseFail = (error) => {
    return {
        type: actionTypes.PURCHASE_FAIL,
        error: error
    }
}


export const userFetchOrders = (Authorization) => {
    return dispatch => {
        dispatch(fetchOrdersStart())
        axios.get('/api/users/me/orders?sortBy=date:desc', {
            headers: {
                Authorization: Authorization
            }
        }).then(res => {
            dispatch(fetchOrdersSuccess(res.data))
        }).catch(e => {
            console.log(e)
            dispatch(fetchOrdersFail('Failed to retrieve Orders!'))
        })
    }
}

export const fetchOrdersStart = () => {
    return {
        type: actionTypes.FETCH_ORDERS_START
    }
}

export const fetchOrdersSuccess = (orders) => {
    return {
        type: actionTypes.FETCH_ORDERS_SUCCESS,
        orders: orders
    }
}

export const fetchOrdersFail = (error) => {
    return {
        type: actionTypes.FETCH_PRODUCTS_FAILED,
        error: error
    }
}

export const userConfirmOrder = (Authorization, orderId) => {
    return dispatch => {
        dispatch(fetchOrdersStart())
        axios.post('/api/users/orders/' + orderId, {}, {
            headers: {
                Authorization: Authorization
            }
        }).then(res => {
            dispatch(userSetOrderSuccess())
            dispatch(userFetchOrders(Authorization))
        }).catch(e => {
            console.log(e)
        })
    }
}

export const userSetOrderSuccess = () => {
    return {
        type: actionTypes.SET_ORDER_SUCCESS
    }
}