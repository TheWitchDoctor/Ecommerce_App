import React from 'react'
import axios from '../../user-axios'
import {connect} from 'react-redux'
import * as actions from '../../store/actions/index'
//import Spinner from '../../components/UI/Spinner/Spinner'
import classes from './Profile.module.css'
import Background from '../../assets/images/bg3.jpg'
import ImageUploader from "react-images-upload"
import Input from '../../components/UI/Input/Input'
import Button from '../../components/UI/Button/Button'
import {updateObject, checkValidity} from '../../shared/utility'

class Profile extends React.Component {
    state= {
        avatar: require('../../assets/images/avatar.jpg'),
        name: null,
        address: null,
        age: null,
        email: null,
        contact: null,
        response: null,
        error: null,
        editMode: false,
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
                    maxLength: 10,
                    minLength: 10
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

        }
    }

    constructor(props) {
        super(props)

        this.onDropAvatar = this.onDropAvatar.bind(this)
    }

    componentDidMount() {
        this.fetchUserAvatar()
        this.fetchUserProfile()
    }


    fetchUserProfile() {
        axios.get('/api/users/me', {
            headers: {
                Authorization: this.props.isAuthenticated
            }
        }).then(res => {
            this.setState({
                ...this.state,
                name: res.data.name,
                address: res.data.address,
                age: res.data.age,
                email: res.data.email,
                contact: res.data.contact
            })
        }).catch(e => {
            console.log(e)
        })
        
    }

    fetchUserAvatar() {
        axios.get('/api/users/me/viewAvatar', {
            headers: {
                Authorization: this.props.isAuthenticated
            }
        }).then(res => {
            
            this.setState({
                ...this.state,
                avatar: res.data
            })
            
        }).catch(e => {
            console.log("No user Avatar has been uploaded")
        })
        
    }

    onDropAvatar (picture) {
        var token = this.props.isAuthenticated
        var bodyFormData = new FormData()
        bodyFormData.append('avatar', picture[0])
        axios({
            method: 'post',
            url: '/api/users/me/avatar',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data', 'Authorization': token}
        })
        .then(response => {
            //handle success
            this.setState({
                ...this.state,
                response: response.data,
                error: null
            })
            this.fetchUserAvatar()
        })
        .catch(e => {
            //handle error
            console.log(e);
            this.setState({
                ...this.state,
                error: "Error Uploading Image. Try a different image...",
                response: null
            })
        });
    }

    switchEditMode () {
        this.setState({
            ...this.state,
            editMode: !this.state.editMode
        })
    }

    inputChangedHandler = (event, controlName) => {
        const updatedControls = updateObject(this.state.controls, {
            [controlName]: updateObject(this.state.controls[controlName], {
                value: event.target.value,
                valid: checkValidity(event.target.value, this.state.controls[controlName].validation),
                touched: true
            }) 
        });
        this.setState({...this.state, controls: updatedControls})
    }

    submitHandler = (event) => {
        event.preventDefault()
        
        if(this.state.editMode) {
            let currentState = this.state.controls
            let person = {
                name: {
                    firstName: currentState.firstName.value,
                    lastName: currentState.lastName.value
                },
                email: currentState.email.value,
                pass: currentState.password.value,
                age: currentState.age.value,
                contact: currentState.contact.value,
                address: {
                    streetName: currentState.street.value,
                    city: currentState.city.value,
                    houseNo: currentState.houseNo.value
                }
            }

            axios.patch('/api/users/me', person, {
                headers: {
                    Authorization: this.props.isAuthenticated
                }
            }).then(res => {
                this.setState({
                    ...this.state,
                    response: 'Profile Updated Successfully!'
                })
            }).catch(e => {
                this.setState({
                    ...this.state,
                    error: 'Error Updating Profile!'
                })
            })
            
        }
        this.fetchUserProfile()
        
    }


    render() {
        let form = ''
        const formElementsArray = [];
        let submitButton = (<span></span>)
        let img = (<img src={this.state.avatar} alt="profile_avatar"/>)
        let response = (<span></span>)

        if(this.state.response) {
            response=(<h2 style={{color: 'limegreen', fontSize: 'large'}}>{this.state.response}</h2>)
        } else if(this.state.error) {
            response=(<h2 style={{color: 'red', fontSize: 'large'}}>{this.state.error}</h2>)
        }

        if(this.state.editMode) {
            for (let key in this.state.controls) {
                formElementsArray.push({
                    id: key,
                    config: this.state.controls[key]
                });
            }
            submitButton = (<Button btnType="Success">SUBMIT</Button>)
        

            form = formElementsArray.map(formElement => {
                let title=null
                if (formElement.id === 'email') {
                    title = 'Email'
                } else if(formElement.id === 'firstName') {
                    title = 'Personal Details'
                } else if(formElement.id === 'houseNo') {
                    title = 'Address'
                } else if (formElement.id === 'password') {
                    title = 'Password'
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
        } else {
            form = (<span></span>)
        }
        

        return (
            <div className={classes.Main} style={{backgroundImage: 'url(' + Background + ')', backgroundSize: 'cover'}}>
                <div className={classes.ProfileImg}>
                    {img}
                    <ImageUploader
                    withIcon={false} 
                    singleImage={true}
                    buttonText='Choose avatar'
                    onChange={this.onDropAvatar}
                    imgExtension={['.jpg', '.png', '.jpeg']}
                    maxFileSize={5242880}
                    />
                    {response}
                </div>
                <div className={classes.ProfileInfo}>
                    <label>Name</label>
                    <p>{this.state.name ? this.state.name.firstName.toUpperCase() + ' ' + this.state.name.lastName.toUpperCase() : null}</p>
                    <label>Age</label>
                    <p>{this.state.age}</p>
                    <label>Contact</label>
                    <p>{this.state.contact}</p>
                    <label>Address</label>
                    <p>{this.state.address ? this.state.address.houseNo + ' ' + this.state.address.streetName + ' ' + this.state.address.city : null}</p>
                    <label>Email</label>
                    <p>{this.state.email}</p>
                    <Button clicked={() =>this.switchEditMode(this)} btnType='Danger'>Edit Profile</Button>
                    <button style={{display: 'block',color: 'red', backgroundColor: 'transparent', border: '0px', marginTop: '20px'}} onClick={this.props.onUserLogoutAll}>Logout All Devices</button>
                </div>
                <form className={classes.ProfileEdit} onSubmit={this.submitHandler}>
                    {form}
                    {submitButton}
                </form>
                
            </div>
        )
        
    }
}

const mapStateToProps = state => {
    return {
        avatar: state.auth.avatar,
        error: state.auth.error,
        loading: state.auth.loading,
        isAuthenticated: state.auth.token
    };
}


const mapDispatchToProps = dispatch => {
    return {
        onUserLogoutAll: () => dispatch(actions.logoutAll()) 
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile, axios);