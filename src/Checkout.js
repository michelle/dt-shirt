import React from 'react';
import {FormGroup, FormControl, ControlLabel, Radio, Button, Glyphicon} from 'react-bootstrap';
import './Checkout.css';

export default class extends React.Component {
  static propTypes = {
    onStyleChange: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      address1: '',
      address2: '',
      state: '',
      city: '',
      zip: '',
      style: 'fitted',
      size: 'M',
      disabled: false,
    };

    this._stripe = Stripe('pk_test_pn9edQ1LOK6zMJnLd9zYzqb2'); // eslint-disable-line
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
  componentDidMount() {
    this._cardField.mount('.Stripe');
  }
  handleChange = (name) => (e) => {
    if (name === 'style') {
      this.props.onStyleChange(e.target.value);
    }
    this.setState({[name]: e.target.value});
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.setState({disabled: true});
    this._stripe.createToken(this._cardField).then((token) => {
      const {size, style, city, state, address1, address2, zip} = this.state;
      return fetch('http://localhost:3000/order', {
        method: 'POST',
        body: {
          shirt: {
            artwork: document.querySelector('canvas').toDataURL(),
            style,
            size,
          },
          stripeToken: token.id,
          address: {
            city,
            state,
            address1,
            address2,
            zip,
          },
        },
      });
    }).then((res) => {
      // TODO
      console.log(res);
      this.setState({disabled: false});
    }, (err) => {
      // TODO
      console.log(err);
      this.setState({disabled: false});
    });
  }

  renderStyles() {
    return (
      <FormGroup controlId="style">
        <ControlLabel>Shirt style</ControlLabel>
        {[['fitted', 'Fitted (Bella Crew)'], ['unisex', 'Unisex V-neck (Canvas Triblend)']].map((style) => (
          <Radio key={style[0]} name="style" value={style[0]} checked={this.state.style === style[0]} onChange={this.handleChange('style')}>
            {style[1]}
          </Radio>
        ))}
      </FormGroup>
    );
  }
  renderSizes() {
    return (
      <FormGroup controlId="size">
        <ControlLabel>Shirt size</ControlLabel>
        <br />
        {['S', 'M', 'L', 'XL'].map((size) => (
          <Radio key={size} name="size" value={size} onChange={this.handleChange('size')} checked={this.state.size === size} inline>
            {size}
          </Radio>
        ))}
      </FormGroup>
    );
  }
  render() {
    const {disabled} = this.state;
    return (
      <form className="App-form" onSubmit={this.handleSubmit}>
        {this.renderStyles()}
        {this.renderSizes()}
        <FormGroup controlId="address">
          <ControlLabel>Shipping address</ControlLabel>
          <FormControl
            type="text"
            name="address1"
            value={this.state.address1}
            placeholder="185 Berry St"
            onChange={this.handleChange('address1')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="address2"
            value={this.state.address2}
            placeholder="Suite 550"
            onChange={this.handleChange('address2')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="city"
            value={this.state.city}
            placeholder="San Francisco"
            onChange={this.handleChange('city')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="state"
            value={this.state.state}
            placeholder="CA"
            onChange={this.handleChange('state')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="zip"
            value={this.state.zip}
            placeholder="94107"
            onChange={this.handleChange('zip')}
          />
        </FormGroup>
        <FormGroup controlId="card" validationState={this.state.error && 'error'}>
          <ControlLabel>Card details</ControlLabel>
          <div className="Stripe form-control" id="card" />
        </FormGroup>
        <Button type="submit" bsStyle="success" bsSize="large" disabled={disabled} block>
          <Glyphicon glyph={disabled ? 'refresh' : 'shopping-cart'} bsClass={disabled ? 'spinning glyphicon' : 'glyphicon'} />{' '}
          {disabled ? 'Processing...' : 'Buy now'}
        </Button>
      </form>
    );
  }
};
