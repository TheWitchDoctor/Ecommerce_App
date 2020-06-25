import React, { Component } from 'react';
import asyncComponent from './hoc/asyncComponent/asyncComponent'

import Layout from './hoc/Layout/Layout'

import {Route, Switch, withRouter, Redirect} from 'react-router-dom'
import Logout from './containers/Auth/Logout/Logout'
import {connect} from 'react-redux'
import * as actions from './store/actions/index'

import Products from './containers/Products/Products';

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3001";

const socket = socketIOClient(ENDPOINT);



const asyncCart = asyncComponent(() => {
  return import('./containers/Cart/Cart')
})

const asyncOrders = asyncComponent(() => {
  return import('./containers/Orders/Orders')
})

const asyncAuth = asyncComponent(() => {
  return import('./containers/Auth/Auth')
})

const asyncProfile = asyncComponent(() => {
  return import('./containers/Profile/Profile')
})

class App extends Component {
  

  componentDidMount () {
    this.props.onTryAutoSignup();
    socket.on("UpdateProduct", data => {
      this.props.onInitProducts(this.props.filter, this.props.sort, this.props.search, this.props.isAuthenticated)
    })
  }
  
  
  render() {

    let routes = (
      <Switch>
        <Route path="/auth" component={asyncAuth}/>   
        <Route path="/" component={Products}/>
        <Redirect to="/"/>
      </Switch>
    );
    if (this.props.isAuthenticated !== null) {
      routes = (
        <Switch>
          <Route path="/cart" component={asyncCart}/>  
          <Route path="/orders" component={asyncOrders}/>    
          <Route path="/logout" component={Logout}/>  
          <Route path="/auth" component={asyncAuth}/>
          <Route path="/profile" component={asyncProfile}/>
          <Route path="/" component={Products}/>
          <Redirect to="/"/>
        </Switch>
      )
    }
    return (
      <div>
        <Layout>
          
          {routes}
          
          {/* Switch with proper order as above OR USE exact */}
          {/* <Route path="/" exact component={BurgerBuilder}/>
          <Route path="/checkout" component={Checkout}/> */}

        </Layout>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token,
    sort: state.product.sortBy,
    filter: state.product.filter,
    search: state.product.search
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState()),
    onInitProducts: (filter, sort, search, Auth) => dispatch(actions.initProducts(filter, sort, search, Auth))
    
  }
}

export {socket}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
