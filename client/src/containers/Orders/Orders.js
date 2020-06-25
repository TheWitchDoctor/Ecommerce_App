import React from 'react'
import OrderItem from '../../components/OrderItem/OrderItem'
import classes from './Orders.module.css'
import axios from '../../user-axios'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/index'
import Background from '../../assets/images/bg2.jpg'
import Spinner from '../../components/UI/Spinner/Spinner'

class Orders extends React.Component {
    componentDidMount() {
        this.props.onFetchUserOrders(this.props.isAuthenticated)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps !== this.props){
            return true
        }
    }

    render() {
        let error=(<span></span>)
        let orders = (<tr style={{color: 'white'}}><td>Failed to Fetch Orders!</td></tr>)
        let count = 0
        if(this.props.orders !==null) {
            orders = (
                this.props.orders.map(order => {
                    let products = (order.products.map(product => {
                        return (<p key={product._id}>{product.title || product._id} : {product.quantity}</p>)
                    }))
                    count+=1
                    return (<OrderItem key={order._id} count={count} orderId={order._id} orderDate={order.date} orderItems={products} orderTotal={parseFloat(order.amount.$numberDecimal).toFixed(2)} orderStatus={order.completed ? 'Delivered' : 'Pending'} orderAddress={order.shippingAddress ? order.shippingAddress : 'Default'}/>)
                })
            )
        } 

        if(this.props.response) {
            error = (<h2 style={{color: 'aliceblue', textAlign: 'center', marginTop: '10px'}}>{this.props.response}</h2>)
        }

        if(this.props.loading) {
            error = (<Spinner/>)
        }

        if(this.props.orders === null) {
            error = (<p>No Orders Found!</p>)
        }
        return (
            <div>
                <div className={classes.Orders} style={{backgroundImage: 'url(' + Background + ')'}}>
                    {error}
                    <table>
                        <tbody>
                            <tr className={classes.Headings}>
                                <td><b>Sr. No.</b></td>
                                <td><b>Order ID</b></td>
                                <td><b>Order Date</b></td>
                                <td><b>Order Items</b></td>
                                <td><b>Order Total ($)</b></td>
                                <td><b>Status</b></td>
                                <td><b>Delivery Confirmation</b></td>
                                <td><b>Shipping Address</b></td>
                            </tr>
                        {orders}
                        </tbody>
                    </table>
                </div>
            </div>
        )
        
    }
}

const mapStateToProps = state => {
    return {
        orders: state.product.orders,
        error: state.product.error,
        errorMessage: state.product.errorMessage,
        response: state.product.response,
        loading: state.product.loading,
        isAuthenticated: state.auth.token
    };
}


const mapDispatchToProps = dispatch => {
    return {
        onFetchUserOrders: (Auth) => dispatch(actions.userFetchOrders(Auth))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(Orders, axios));