import React from 'react';
import {FormGroup, FormControl, HelpBlock, ControlLabel, Radio, Button, Glyphicon} from 'react-bootstrap';
import CheckoutForm from './CheckoutForm';
import './Checkout.css';

const STRIPE_KEY = process.env.NODE_ENV === 'production' ? 'pk_live_i8dM4Z7Z9yHAry8CUyfG2zzu' : 'pk_test_qCMrlL2cgZqc4jlUQH6WEyBS';

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
        focus: 'is-focused',
        invalid: 'is-invalid',
      },
      style: {
        base: {
          lineHeight: '20px',
          fontSize: '16px',
          fontSmoothing: 'antialiased',
          fontFamily: 'Helvetica Neue, Helvetica, sans-serif',
        },
        invalid: {
          color: '#a94442',
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
    this._stripe.createToken(this._cardField).then((token) => {
      return fetch('http://localhost:3002/order', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({...data, stripeToken: token.id}),
      });
    }).then((res) => {
      // TODO
      return res.json();
    }).then((payload) => {
      this.setState({disabled: false, orderId: payload.order, orderErrors: payload.issues || payload.orderIssues || []});
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
        <Button onClick={this.handleReset} bsStyle="primary" bsSize="large">
          <Glyphicon glyph="heart" />{' '}
          Get another shirt
        </Button>
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
