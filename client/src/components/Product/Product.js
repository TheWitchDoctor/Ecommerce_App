import React from 'react';
import classes from './Product.module.css'
import Button from '../UI/Button/Button'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/index'


function Product(props) {
  const outOfStock = parseInt(props.product.quantityInStock) <= 0
  const prod = {
    title: props.product.title,
    price: props.product.price.$numberDecimal,
    quantity: props.cart[props.product.title]
  }

  let button = (<div style={{marginLeft:"37%"}}><Button btnType={outOfStock ? 'Danger' : 'Success'} disabled={outOfStock} clicked={() => props.onAddProduct(prod, props.isAuthenticated)}>Add to Cart</Button></div>)
  if(props.cart[props.product.title]){
    button = (
      <div className={classes.productControl}>
        <Button btnType='Danger' disabled={outOfStock & props.cart[props.product.title]===0} clicked={() => props.onRemoveProduct(prod, props.isAuthenticated)}>-</Button>
        <p>{props.cart[props.product.title]} in Cart</p>
        <Button btnType='Success' disabled={outOfStock} clicked={() => props.onAddProduct(prod, props.isAuthenticated)}>+</Button>
      </div>
    )
  }
  return (
    <div className = {classes.product} style = {{backgroundImage: "linear-gradient(to top, #0c3483 0%, #a2b6df 100%, #6b8cce 100%, #a2b6df 100%)"}}>
      <div>
        <img className={classes.productImg} src={require('../../assets/images/products/' + props.product.title.split(" ").join("") + '.jpg')} alt={props.title}/>
      </div>
      <div className={classes.productText}>
        <h2>{props.product.title.toUpperCase()}</h2>
        <p>Price : ${parseFloat(props.product.price.$numberDecimal)}</p>
        <p>Size : {props.product.size}</p>
        <p>In Stock : {props.product.quantityInStock}</p>
      </div>
      {button}
      
    </div>
  );
}

const mapStateToProps = state => {
    return {
        products: state.product.products,
        price: state.product.totalPrice,
        error: state.product.error,
        isAuthenticated: state.auth.token,
        cart: state.product.cart
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onAddProduct: (prod, Auth) => dispatch(actions.updateProduct(prod, 'add', Auth)),
        onRemoveProduct: (prod, Auth) => dispatch(actions.updateProduct(prod, 'remove', Auth))
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(Product);