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
      address_line1: '',
      address_line2: '',
      address_state: '',
      address_zip: '',
      style: 'fitted',
      size: 'M',
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
    fetch('http://localhost:3000/test', {
      method: 'POST',
      body: {
        test: true,
      },
    }).then((res) => console.log(res));
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
    return (
      <form className="App-form" onSubmit={this.handleSubmit}>
        {this.renderStyles()}
        {this.renderSizes()}
        <FormGroup controlId="address">
          <ControlLabel>Shipping address</ControlLabel>
          <FormControl
            type="text"
            value={this.state.address_line1}
            placeholder="185 Berry St"
            onChange={this.handleChange('address_line1')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            value={this.state.address_line2}
            placeholder="Suite 550"
            onChange={this.handleChange('address_line2')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            value={this.state.address_state}
            placeholder="San Francisco"
            onChange={this.handleChange('address_state')}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            value={this.state.address_zip}
            placeholder="94107"
            onChange={this.handleChange('address_zip')}
          />
        </FormGroup>
        <FormGroup controlId="card" validationState={this.state.error && 'error'}>
          <ControlLabel>Card details</ControlLabel>
          <div className="Stripe form-control" id="card" />
        </FormGroup>
        <Button type="submit" bsStyle="success" bsSize="large" block><Glyphicon glyph="shopping-cart" />{' '}Buy</Button>
      </form>
    );
  }
};
