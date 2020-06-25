import React, {Component} from 'react'
import Input from '../../components/UI/Input/Input'
import Button from '../../components/UI/Button/Button'
import classes from './Auth.module.css'
import * as actions from '../../store/actions/index'
import {connect} from 'react-redux'
import Spinner from '../../components/UI/Spinner/Spinner'
import {Redirect} from 'react-router-dom'
import {updateObject, checkValidity} from '../../shared/utility'

class Auth extends Component {
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Enter Email Address'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
            },
            firstName: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter First Name'
                },
                value: '',
                validation: {
                    required: true
                },
                valid: false,
                touched: false
            },
            lastName: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter Last Name'
                },
                value: '',
                validation: {
                    required: true
                },
                valid: false,
                touched: false
            },
            age: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter age'
                },
                value: '',
                validation: {
                    min: 18,
                    max: 100,
                    isNumeric: true
                },
                valid: true,
                touched: false
            },
            contact: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter Your Contact',
                    isNumeric: true
                },
                value: '',
                validation: {
                    required: true,
                    maxLength:10,
                    minLength:10
                },
                valid: false,
                touched: false
            },
            houseNo: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter Local House Address'
                },
                value: '',
                validation: {
                    required: true
                },
                valid: false,
                touched: false
            },
            street: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter Street Name'
                },
                value: '',
                validation: {
                    required: true
                },
                valid: false,
                touched: false
            },
            city: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Enter City'
                },
                value: '',
                validation: {
                    required: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 7
                },
                valid: false,
                touched: false
            }
            
        },
        isSignup: true
    }


    inputChangedHandler = (event, controlName) => {
        const updatedControls = updateObject(this.state.controls, {
            [controlName]: updateObject(this.state.controls[controlName], {
                value: event.target.value,
                valid: checkValidity(event.target.value, this.state.controls[controlName].validation),
                touched: true
            }) 
        });
        this.setState({controls: updatedControls})
    }

    submitHandler = (event) => {
        event.preventDefault()
        if(this.state.isSignup) {
            let currentState = this.state.controls
            if(currentState.age.value === ''){
                currentState.age.value = 18
            }
            let person = {
                name: {
                    firstName: currentState.firstName.value,
                    lastName: currentState.lastName.value
                },
                email: currentState.email.value,
                pass: currentState.password.value,
                age: parseInt(currentState.age.value),
                contact: currentState.contact.value,
                address: {
                    streetName: currentState.street.value,
                    city: currentState.city.value,
                    houseNo: currentState.houseNo.value
                },
                orders: [],
                cart: {
                    products: [],
                    total: 0.0
                }
            }
            return this.props.onSignUp(person, this.props.cart)
        } else {
            return this.props.onLogin(this.state.controls.email.value, this.state.controls.password.value, this.props.cart)
        }
        
    }
    
    switchAuthModeHandler = () => {
        this.setState(prevState => {
            return {isSignup: !prevState.isSignup}
        })
    }

    render () {
        const formElementsArray = [];
        if(this.state.isSignup === true){
            for (let key in this.state.controls) {
                formElementsArray.push({
                    id: key,
                    config: this.state.controls[key]
                });
            }
        } else {
            for (let key in this.state.controls) {
                if(key === 'email' || key === 'password') {
                    formElementsArray.push({
                        id: key,
                        config: this.state.controls[key]
                    });
                }
            }
        }

        let form = formElementsArray.map(formElement => {
            let title=null
            if (formElement.id === 'email' & this.state.isSignup) {
                title = 'Email'
            } else if(formElement.id === 'firstName') {
                title = 'Personal Details'
            } else if(formElement.id === 'houseNo') {
                title = 'Address'
            } else if (formElement.id === 'password' & this.state.isSignup) {
                title = 'Password'
            } else if (formElement.id === 'email' & !this.state.isSignup){
                title = 'Login'
            }

            let input =
            ( <div key = {formElement.id}>
            {title ? <h3 style={{color:'limegreen',textAlign:'left', marginLeft:'10px', marginBottom:'0px', marginTop:'40px'}}>{title}</h3> : null}
            <Input  
            elementType={formElement.config.elementType} 
            elementConfig={formElement.config.elementConfig} 
            value={formElement.config.value} 
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            valueType={formElement.id}
            changed={(event) => this.inputChangedHandler(event, formElement.id)}
            />
            </div>) 

            return input
            
        });

        if (this.props.loading) {
            form = <Spinner/>
        }

        let errorMessage = null;
        if (this.props.error) {
            errorMessage = (
            <p style={{color:'red'}}>{this.props.error.message}</p>
            )
        }

        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath}/>
        }

        return (
            <div className={classes.Auth}>
                {authRedirect}
                <Button 
                clicked={this.switchAuthModeHandler} 
                btnType="Broad">SWITCH TO {this.state.isSignup ? 'SIGN IN' : 'SIGN UP'}</Button>
                {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType="Success">SUBMIT</Button>
                </form>
                
            </div>
        )
    }
    
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuthenticated: state.auth.token,
        authRedirectPath: state.auth.authRedirectPath,
        cart: state.product.cart
        
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSignUp: (person, cart) => dispatch(actions.onSignUp(person, cart)),
        onLogin: (email, password, cart) => dispatch(actions.auth(email, password, cart)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);