import React from 'react'
import Button from '../UI/Button/Button'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/index'
import classes from './CartItem.module.css'

function CartItem(props) {
    const outOfStock = parseInt(props.stockQuantity) <= 0

    return (
        
        <tr className={classes.CartItem}>
            <th>{props.count}</th>
            <td>{props.productTitle.toUpperCase()}</td>
            <td><img className={classes.productImg} src={require('../../assets/images/products/' + props.productTitle.split(" ").join("") + '.jpg')} alt={props.productTitle}/></td>
            <td>{props.productPrice}</td>
            <td>{props.stockQuantity}</td>
            <td>
                <div className={classes.CartControls}>
                    <Button btnType='Danger' disabled={outOfStock & props.productQuantity === 0} clicked={() => props.onRemoveProduct({title: props.productTitle, price: props.productPrice}, props.isAuthenticated)}>-</Button>
                    <p>{props.productQuantity} in Cart</p>
                    <Button btnType='Success' disabled={outOfStock} clicked={() => props.onAddProduct({title: props.productTitle, price: props.productPrice}, props.isAuthenticated)}>+</Button>
                </div>
            </td>
            <td>{parseFloat(props.productPrice*props.productQuantity).toFixed(2)}</td>
            <td> <Button btnType = "Danger" clicked = {() => props.onDeleteProduct({title: props.productTitle, price: props.productPrice, quantity: props.productQuantity},props.isAuthenticated)}>X</Button></td>
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
        onAddProduct: (product, Auth) => dispatch(actions.updateProduct(product, 'add', Auth)),
        onRemoveProduct: (product, Auth) => dispatch(actions.updateProduct(product, 'remove', Auth)),
        onDeleteProduct: (product, Auth) => dispatch(actions.updateProduct(product, 'delete', Auth)),
        onFetchUserCart: (Auth) => dispatch(actions.fetchUserCart(Auth))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CartItem);