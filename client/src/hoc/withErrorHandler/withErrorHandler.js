import Modal from '../../components/UI/Modal/Modal'
import React, {Component} from 'react'
import Auxiliary from '../Auxiliary/Auxiliary'

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends Component {
        state = {
            error: null
        }
        constructor(props) {
            super(props)
            this.reqInterceptor = axios.interceptors.request.use(req => {
                this.setState({error: null})
                return req;
            });
            this.resInterceptor = axios.interceptors.response.use(res => res, error => {
                this.setState({error: error});
            });
        }

        componentWillUnmount() {
            axios.interceptors.request.eject(this.reqInterceptor);
            axios.interceptors.response.eject(this.resInterceptor)
        }

        // componentDidMount () {
            
        // }

        errorConfirmedHandler = () => {
            this.setState({error: null})
        }

        render() {
            let modal = null
            if(this.state.error) {
                modal = (<Modal 
                    show={this.state.error} 
                    modalClosed={this.errorConfirmedHandler}>
                        {this.state.error.message === 'Request failed with status code 404' ? 'Product Not Found' : this.state.error.message}
                    </Modal>)
            }
            return (
                <Auxiliary>
                    {modal}
                    <WrappedComponent {...this.props}/>
                </Auxiliary>
            );
        }
    }
}

export default withErrorHandler;