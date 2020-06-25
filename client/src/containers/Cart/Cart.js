import React from 'react'
import CartItem from '../../components/CartItem/CartItem'
import classes from './Cart.module.css'
import axios from '../../user-axios'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/index'
import Background from '../../assets/images/bg1.jpg'
import Spinner from '../../components/UI/Spinner/Spinner'
import {withRouter} from 'react-router-dom'

class Cart extends React.Component {
    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        this.props.onFetchUserCart(this.props.isAuthenticated)
    }
    
    convertCart () {
        let cart = []
        for(var key in this.props.cart) {
            cart.push({title: key, quantity: this.props.cart[key]})
        }
        return cart
    }

    placeOrderHandler () {
        this.props.onUserPlaceOrder(this.props.isAuthenticated)
        this.props.history.push('/orders')
    }

    render() {
        let orderButton = (<button className={classes.OrderButton} onClick={()=>this.placeOrderHandler()} disabled={parseFloat(this.props.price) < 0.01}>PLACE ORDER</button>)
        let error = <span></span>

        if(this.props.error) {
            error = (<h3 style={{color:'red'}}>{this.props.errorMessage}</h3>)
        }

        if(this.props.loading) {
            orderButton = <Spinner/>
        }


        let cart = (<tr><td>Cart cannot be loaded</td></tr>)
        
        if(this.props.cart) {
            if (Object.keys(this.props.cart).length === 0) {
                cart = (<tr><td>Cart is Empty!</td></tr>)
            } else {
                let count = 0
                let clientCart = this.convertCart()
                cart = (
                    clientCart.map(item => {
                        count+=1
                        let product = this.props.products.find(product => product.title === item.title)
                        return (
                            <CartItem key={item.title} count={count} productTitle={item.title} productPrice={product.price.$numberDecimal} stockQuantity={product.quantityInStock} productQuantity={item.quantity}/>
                        )
                    })
                )
                
                
            }
        }
        return (
            <div>
                <div className={classes.Cart} style={{backgroundImage: 'url(' + Background + ')',backgroundSize: 'cover'}}>
                    {error}
                    <table>
                        <tbody>
                            <tr className={classes.Headings}>
                                <td><b>Sr. No.</b></td>
                                <td><b>Product Title</b></td>
                                <td><b>Product</b></td>
                                <td><b>Product Price ($)</b></td>
                                <td><b>In Stock</b></td>
                                <td><b>Quantity In Cart</b></td>
                                <td><b>Item Total ($)</b></td>
                                <td><b>Remove Product</b></td>
                            </tr>
                        {cart}
                        </tbody>
                    </table>
                    <h2>Order Total :  ${parseFloat(this.props.price).toFixed(2)}</h2>
                    {orderButton}
                </div>
                
            </div>
        )
        
    }
}

const mapStateToProps = state => {
    return {
        products: state.product.products,
        cart: state.product.cart,
        price: state.product.totalPrice,
        error: state.product.error,
        errorMessage: state.product.errorMessage,
        response: state.product.response,
        loading: state.product.loading,
        isAuthenticated: state.auth.token
    };
}


const mapDispatchToProps = dispatch => {
    return {
        onFetchUserCart: (Auth) => dispatch(actions.fetchUserCart(Auth)),
        onUserPlaceOrder: (Auth) => dispatch(actions.userPlaceOrder(Auth))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withErrorHandler(Cart, axios)));