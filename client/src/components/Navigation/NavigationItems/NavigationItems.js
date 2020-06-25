import React from 'react'
import classes from './NavigationItems.module.css'
import NavigationItem from './NavigationItem/NavigationItem'
import cartLogo from '../../../assets/images/shopping-cart.png'

const cart = (
    <div className={classes.Logo} style={{height: 45, marginTop: '-10px'}}>
        <img src={cartLogo} alt="My Burger"/>
    </div>
)

const navigationItems = (props) => (
    <ul className={classes.NavigationItems}>
        <NavigationItem link="/" exact>Home</NavigationItem>
        {props.isAuthenticated 
            ? <NavigationItem link="/orders">Orders</NavigationItem> 
            : null }
        
        {props.isAuthenticated
        ? <NavigationItem link="/profile" exact>My  Profile</NavigationItem>
        : null}
        
        {props.isAuthenticated 
            ? <NavigationItem link="/cart" exact>{cart}</NavigationItem> 
            : <NavigationItem link="/auth">{cart}</NavigationItem> }
       

        { props.isAuthenticated 
            ? <NavigationItem link="/logout">Logout</NavigationItem> 
            : <NavigationItem link="/auth">Login</NavigationItem>}
        
    </ul>
);



export default navigationItems;