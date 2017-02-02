import React from 'react';
import {FormGroup, FormControl, HelpBlock, ControlLabel, Radio, Button, Glyphicon} from 'react-bootstrap';
import CheckoutForm from './CheckoutForm';
import './Checkout.css';

const STRIPE_KEY = process.env.NODE_ENV === 'production' ? 'pk_live_i8dM4Z7Z9yHAry8CUyfG2zzu' : 'pk_test_qCMrlL2cgZqc4jlUQH6WEyBS';
const API_URL = process.env.NODE_ENV === 'production' ? '/order' : 'http://localhost:3002/order';

export default class extends React.Component {
  static propTypes = {
    onStyleChange: React.PropTypes.func.isRequired,
    onCheckout: React.PropTypes.func.isRequired,
    onComplete: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      orderId: null,
      orderErrors: [],
    };
    this.setupStripe();
  }
  setupStripe() {
    this._stripe = Stripe(STRIPE_KEY); // eslint-disable-line
    this._cardField = this._stripe.elements().create('card', {
      classes: {
        empty: 'is-empty',
        focus: 'is-focused',
        invalid: 'is-invalid',
      },
      style: {
        base: {
          lineHeight: '28px',
          placeholderColor: '#ccc',
          fontSize: '16px',
          fontWeight: 400,
          fontSmoothing: 'antialiased',
          fontFamily: 'Helvetica Neue, Helvetica, sans-serif',
        },
      },
    });
    this._cardField.on('change', (payload) => {
      this.setState({error: payload.error});
    });
  }

  handleSubmit = (data) => {
    this.setState({disabled: true});
    this.props.onCheckout();
    this._stripe.createToken(this._cardField).then(({token, error}) => {
      if (token) {
        return fetch(API_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({...data, stripeToken: token.id}),
        });
      } else {
        throw error;
      }
    }).then((res) => {
      // TODO
      return res.json();
    }).then((payload) => {
      this.setState({disabled: false, orderId: payload.order, error: payload.error, orderErrors: payload.issues || payload.orderIssues || []});
    }).catch((err) => {
      // TODO
      console.log('got error', err);
      this.setState({disabled: false});
      this.props.onComplete();
    });
  }
  handleReset = () => {
    this.setState({orderId: null});
    this.props.onComplete();
  }
  renderForm() {
    const {disabled, error, orderErrors} = this.state;
    return <CheckoutForm onStyleChange={this.props.onStyleChange} onSubmit={this.handleSubmit} cardElement={this._cardField} disabled={disabled} error={error} orderErrors={orderErrors} />;
  }
  renderSuccess() {
    return (
      <div className="Checkout-success">
        <p className="Checkout-success-title">
          Congrats on your pretty cool shirt!
        </p>
        <p>
          You should receive an email shortly with your order confirmation number.
        </p>
        <button onClick={this.handleReset}>
          <Glyphicon glyph="heart" />{' '}
          Get another shirt
        </button>
      </div>
    );
  }
  render() {
    const {orderId} = this.state;
    if (orderId) {
      return this.renderSuccess();
    } else {
      return this.renderForm();
    }
  }
};
