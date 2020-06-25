import * as actionTypes from '../actions/actionTypes'
import {updateObject} from '../../shared/utility'
import Cookies from 'universal-cookie'


const cookies = new Cookies()

const initialState = {
        products: null,
        totalPrice: 0,
        error: false,
        errorMessage: '',
        loading: false,
        firstLoad: true,
        allProducts: null,
        sortBy: 'sortBy=price:desc',
        filter: '',
        search: '',
        cart: {},
        response: null,
        orders: null,
        redirect: '/'
};

const setCookie = (cart) => {
    let d = new Date();
    d.setTime(d.getTime() + (60*60*1000));

    cookies.set("cart", cart, {expires: d})
}


const setProducts = (state, action) => {
        if(state.firstLoad === true){
                return updateObject(state, {
                        products: action.products,
                        allProducts: action.products,
                        firstLoad: false,
                        error: false
                })
        } else {
                return updateObject(state, {
                        products: action.products,
                        error: false,
                        sortBy: action.sort,
                        filter: action.filter,
                        search: action.search

                });
        }
        
}

const fetchProductsFailed = (state, action) => {
        return updateObject(state, {error: true, errorMessage: action.error.message});
}


const addProduct = (state, action) => {
    let newCart = {...state.cart}
    let title = action.productTitle
    let totalPrice = parseFloat(state.totalPrice) + parseFloat(action.productPrice)
    if (parseFloat(totalPrice) < 0.01) {
            totalPrice = 0.0
    }
    if(state.cart[action.productTitle]){
        newCart[title]+=1
        setCookie(newCart)
        return updateObject(state, {
                cart: newCart,
                totalPrice: totalPrice
        })
    } else {
        newCart[title]=1
        setCookie(newCart)
        return updateObject(state, {
                cart: newCart,
                totalPrice: totalPrice
        })
    }
    

}

const removeProduct = (state, action) => {
    let newCart = {...state.cart}
    let title = action.productTitle
    let totalPrice = parseFloat(state.totalPrice) - parseFloat(action.productPrice)
    if (parseFloat(totalPrice) < 0.01) {
            totalPrice = 0.0
    }
    if(state.cart[action.productTitle]>1){
        newCart[title]-=1
        setCookie(newCart)
        return updateObject(state, {
                cart: newCart,
                totalPrice: totalPrice
        })
    } else if (state.cart[action.productTitle] === 1) {
        delete newCart[title]
        setCookie(newCart)
        return updateObject(state, {
                cart: newCart,
                totalPrice: totalPrice
        })
    }
}

const deleteProduct = (state, action) => {
        let newCart = {...state.cart}
        let title = action.productTitle
        let quantity = action.productQuantity
        let price = action.productPrice
        let totalPrice = parseFloat(state.totalPrice) - parseFloat(price * quantity)
        if(parseFloat(totalPrice)<0.01){
                totalPrice = 0.0
        }
        delete newCart[title]
        setCookie(newCart)
        return updateObject(state, {
                cart: newCart,
                totalPrice: totalPrice
        })
}

const setCart = (state, action) => {
        return updateObject (state, {
                cart: action.cart,
                error: false,
                loading: false
        })
}

const fetchCartFailed = (state, action) => {
        return updateObject(state, {
                error: true,
                loading: false
        });
}

const fetchCartSuccess = (state, action) => {
        cookies.remove('cart')
        let newCart = {
                ...action.clientCart
        }
        setCookie(newCart)
        return updateObject(state, {
                cart: newCart,
                totalPrice: action.cart.total.$numberDecimal,
                error: false,
                loading: false
        })
}

const fetchCartStart = (state, action) => {
        return updateObject(state, {
                loading: true
        })
}

const purchaseStart = (state, action) => {
        return updateObject(state, {
                loading: true
        })
}

const purchaseSuccess = (state, action) => {
        cookies.remove("cart")
        return updateObject(state, {
                loading: false,
                error: false,
                totalPrice: 0,
                cart: {},
                response: action.msg,
                redirect: '/orders'

        })
}

const purchaseFail = (state, action) => {
        return updateObject(state, {
                loading: false,
                error: true,
                errorMessage: action.error
        })
}

const fetchOrdersStart = (state, action) => {
        return updateObject(state, {
                loading: true
        })
}

const fetchOrdersSuccess = (state, action) => {
        return updateObject(state, {
                loading: false,
                error: false,
                orders: action.orders
        })
}

const fetchOrdersFail = (state, action) => {
        return updateObject(state, {
                loading: false,
                error: true,
                errorMessage: action.error
        })
}

const userConfirmOrderDelivery = (state, action) => {
        return updateObject(state, {
                loading: false
        })
}

const reducer = (state = initialState, action) => {
        switch(action.type) {
                case actionTypes.SET_PRODUCTS:
                        return setProducts(state, action)
                        
                case actionTypes.FETCH_PRODUCTS_FAILED:
                        return fetchProductsFailed(state, action)
                
                case actionTypes.ADD_PRODUCT:
                        return addProduct(state, action)
                
                case actionTypes.REMOVE_PRODUCT:
                        return removeProduct(state, action)

                case actionTypes.DELETE_PRODUCT:
                        return deleteProduct(state, action)

                case actionTypes.SET_CART:
                        return setCart(state, action)

                case actionTypes.FETCH_CART_SUCCESS:
                        return fetchCartSuccess(state, action)

                case actionTypes.FETCH_CART_FAIL:
                        return fetchCartFailed(state, action)
                
                case actionTypes.FETCH_CART_START:
                        return fetchCartStart(state, action)
                
                case actionTypes.PURCHASE_START:
                        return purchaseStart(state, action)

                case actionTypes.PURCHASE_SUCCESS:
                        return purchaseSuccess(state, action)

                case actionTypes.PURCHASE_FAIL:
                        return purchaseFail(state, action)

                case actionTypes.FETCH_ORDERS_START:
                        return fetchOrdersStart(state, action)

                case actionTypes.FETCH_ORDERS_SUCCESS:
                        return fetchOrdersSuccess(state, action)

                case actionTypes.FETCH_ORDERS_FAIL:
                        return fetchOrdersFail(state, action)
                        
                case actionTypes.SET_ORDER_SUCCESS:
                        return userConfirmOrderDelivery(state, action)

                default:
                        return state;
        };
}
export default reducer;
