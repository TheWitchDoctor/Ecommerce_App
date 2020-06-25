import React from 'react'
import Button from '../UI/Button/Button'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/index'
import classes from './OrderItem.module.css'

function OrderItem(props) {
    

    return (
        
        <tr className={classes.OrderItem}>
            <th>{props.count}</th>
            <td>{props.orderId}</td>
            <td>{props.orderDate}</td>
            <td>{props.orderItems}</td>
            <td>{props.orderTotal}</td>
            <td>{props.orderStatus}</td>
            <td><Button btnType={props.orderStatus === 'Pending' ? 'Success' : 'Danger'} disabled={props.orderStatus === 'Delivered'} clicked={() => props.onUserConfirmOrder(props.isAuthenticated, props.orderId)}>{props.orderStatus === 'Pending' ? 'Confirm Delivery' : 'Order Delivered'}</Button></td>
            <td>{props.orderAddress}</td>
        </tr>
    )


}

const mapStateToProps = state => {
    return {
        error: state.product.error,
        isAuthenticated: state.auth.token
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onUserConfirmOrder: (Auth, orderId) => dispatch(actions.userConfirmOrder(Auth, orderId))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderItem);