import * as actionTypes from './actionTypes'
import axios from '../../user-axios'
import Cookies from 'universal-cookie'
import * as actions from './index'

const cookies = new Cookies()

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
};

export const authSuccess = (token, path) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        redirectPath: path
    }
}

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
};

export const logoutClient = () => {
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const logout = () => {
    return dispatch => {
        if(cookies.get('token')){
            axios.post('/api/users/logout', {}, {
                headers: {
                    Authorization: 'Bearer ' + cookies.get('token')
                }
            }).then(res => {
                cookies.remove('token')
                cookies.remove('cart')
                dispatch(logoutClient())
                dispatch(unsetCart())
            }).catch(e => {
                console.log('Error Logging Out')
            })
        } else {
            dispatch(logoutClient())
        }
    }
    
};

export const logoutAll = () => {
    return dispatch => {
        if(cookies.get('token')){
            axios.post('/api/users/logoutALL', {}, {
                headers: {
                    Authorization: 'Bearer ' + cookies.get('token')
                }
            }).then(res => {
                cookies.remove('token')
                cookies.remove('cart')
                dispatch(logoutClient())
                dispatch(unsetCart())
            }).catch(e => {
                console.log('Error Logging Out')
            })
        }
    }
}

export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    }
}

export const unsetCart = () => {
    cookies.remove('cart')
    return {
        type: actionTypes.SET_CART,
        cart: {}
    }
}

export const authCheckState = () => {
    return dispatch => {
        let token = cookies.get('token')
        if (!token) {
            dispatch(logout());
        } else { 
            dispatch(authSuccess(token, '/')); 
        }
    }
}

export const signUpStart = () => {
    return {
        type: actionTypes.SIGNUP_START
    }
};


export const signUpFail = (error) => {
    return {
        type: actionTypes.SIGNUP_FAIL,
        error: error
    }
}

const setCookie = (token) => {
    let d = new Date();
    d.setTime(d.getTime() + (60*60*1000));

    cookies.set("token", token, {expires: d})
}

export const onSignUp = (person, cart) => {
    return dispatch => {
        dispatch(signUpStart())
        axios.post('/api/users', person)
            .then(res => {
                setCookie(res.data.token)
                dispatch(updateCart(cart, 'login', res.data.token))
            
            }
            ).catch(e => {
                console.log(e)
                if (e.message === 'Request failed with status code 500') {
                    dispatch(signUpFail({message: 'Contact and Age should be a number! Contact 10 digits and age between 18 and 100.'}))
                } else if (e.message === 'Request failed with status code 400'){
                    dispatch(signUpFail({message: 'Email or Contact already exists'}))
                }
                

                   
        })
    }
}


export const auth = (email, password, cart) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            email: email,
            pass: password
        };
        axios.post('/api/users/login', authData)
            .then(response => {
                setCookie(response.data.token)
                dispatch(updateCart(cart, 'login', response.data.token))
                dispatch(actions.fetchUserCart(response.data.token))
                
            })
            .catch(err => {
               console.log(err)
               dispatch(authFail({message: "Incorrect Credentials!"})) 
            })
    }
}

const updateCart = (cart, updateType, token) => {
    return dispatch => {
    let newCart = []
    for(var key in cart) {
        newCart.push({product: key, quantity: cart[key]})
    }
    axios.post('/api/users/me/updateCart', {cart: newCart, update: updateType}, {
        headers: {
            Authorization: token
        }
    }).then(res => {
        
        if (cookies.get("cart") !== undefined) {
            dispatch(authSuccess(token, '/cart'))
        } else {
            dispatch(authSuccess(token, '/'))
        }
        console.log("User Cart has been Updated")
    }).catch(e => {
        console.log("Error Updating User Cart")
    })
    }
}
