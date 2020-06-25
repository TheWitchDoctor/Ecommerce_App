import React from 'react';
import Product from '../../components/Product/Product';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'
import {connect} from 'react-redux'
import axios from '../../user-axios'
import * as actions from '../../store/actions/index'
import classes from './Products.module.css'
import Background from '../../assets/images/bg.jpg'

class Products extends React.Component {
  state = {
    search: null
  }

  constructor(props) {
    super(props)

    this.changeCategoryHandler = this.changeCategoryHandler.bind(this)
    this.changeSortHandler = this.changeSortHandler.bind(this)
    this.searchProductHandler = this.searchProductHandler.bind(this)
    
  }

  
  componentDidMount () {
      this.props.onInitProducts('', this.props.sort, '', this.props.isAuthenticated)
      this.props.onCartCheckState()
       
  }


  changeCategoryHandler (event) {
    let category = '&category=' + event.target.value
    if(event.target.value === 'ALL'){
      this.props.onInitProducts('', this.props.sort, '', this.props.isAuthenticated)
    } else {
      this.props.onInitProducts(category, this.props.sort, '', this.props.isAuthenticated)
    }
  }

  changeSortHandler (event) {
    let sort = this.props.sort
    if(event.target.value === 'asc'){
      sort = sort.split(':')[0] + ':' + event.target.value
    } else if(event.target.value === 'desc') {
      sort = sort.split(':')[0] + ':' + event.target.value
    } else {
      sort = 'sortBy=' + event.target.value + ':' + sort.split(':')[1]
    }

    this.props.onInitProducts(this.props.filter, sort, '', this.props.isAuthenticated)
  }

  searchChangeHanlder (event) {
    this.setState({...this.state, search: event.target.value})
  }

  searchProductHandler (event) {
    event.preventDefault()
    let sort = this.props.sort
    let search = '&title=' + this.state.search
    if(this.state.search === null) {
      search = "&title="
    }
    this.props.onInitProducts('', sort, search, this.props.isAuthenticated)
  }

  
  render() {
    let products = (
        <p>Products cannot be loaded</p>
        )
    
    let categories = []
    let categoryMenu = (
        <option>No Categories Loaded</option>
    )

    if(this.props.products) {
        products = (
          this.props.products.map(product => (
           
              <Product 
                key={product.title}
                product={product} />
            
          ))
        )
        if(this.props.error){
          products = (<h3>{this.props.errorMessage}</h3>)
        }
        
        categoryMenu = (
            this.props.allProducts.map(product => {
            if(!categories.includes(product.category)){
              categories.push(product.category)
              return (<option key={product.category} value={product.category}>{(product.category).toUpperCase()}</option>)
            } else {
              return null
            }
              
          })
        )
        
    }

    return (
      <div>
      <div style={{backgroundImage: 'url('+ Background +')', backgroundSize: 'cover', paddingBottom: '20px', marginTop: '-5px'}}>
          <div>
            <form onSubmit={this.searchProductHandler}>
              <span className={classes.input}>
              <label><b style={{color: 'whitesmoke', fontSize: '18px'}}>Product Search</b></label>
              <input className={classes.searchInput} type='text' name='product' placeholder='Enter Product Name' onChange={(event) => this.searchChangeHanlder(event)}></input>
              <button className={classes.button} type='submit' value=''>Search</button>
              </span>
            </form>
            <button className={classes.buttonReset} onClick={() => window.location.reload(false)}>RESET FILTERS</button>
          </div>
          <div className={classes.filter}>
            <div className={classes.categoryFilter}>
              <label>
                <b>Select Category :</b> 
                <select defaultValue='ALL' onChange={this.changeCategoryHandler}>
                  <option value='ALL'>ALL</option>
                  {categoryMenu}
                </select>
              </label>
            </div>
            <div className={classes.sortFilter}>
              <label>
                <b>Sort Order :</b> 
                <select defaultValue='price' onChange={this.changeSortHandler}>
                  <option value='price'>Price</option>
                  <option value='quantity'>Quantity In Stock</option>
                  <option value='title'>Product Title</option>
                  <option value='category'>Category</option>
                </select>
                <select defaultValue='desc' onChange={this.changeSortHandler}>
                  <option value='desc'>Descending</option>
                  <option value='asc'>Ascending</option>
                </select>
              </label>
            </div>
          </div>
        <div className={classes.Products}>
          {products}
        </div>
      </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
    return {
        products: state.product.products,
        allProducts: state.product.allProducts,
        price: state.product.totalPrice,
        error: state.product.error,
        errorMessage: state.product.errorMessage,
        isAuthenticated: state.auth.token,
        authRedirectPath: state.auth.authRedirectPath,
        sort: state.product.sortBy,
        filter: state.product.filter,
        search: state.product.search
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onInitProducts: (filter, sort, search, Auth) => dispatch(actions.initProducts(filter, sort, search, Auth)),
        onCartCheckState: () => dispatch(actions.cartCheckState())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(Products, axios));