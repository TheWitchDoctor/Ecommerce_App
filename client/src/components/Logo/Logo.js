import React from 'react'
import groceryLogo from '../../assets/images/groceryStore.webp';
import classes from './Logo.module.css'

const logo = (props) => (
    <div className={classes.Logo} style={{height: props.height}}>
        <img src={groceryLogo} alt="My Burger"/>
    </div>
);

export default logo;