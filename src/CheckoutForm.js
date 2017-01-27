import React from 'react';
import {FormGroup, FormControl, HelpBlock, ControlLabel, Radio, Button, Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      address1: '',
      address2: '',
      state: '',
      city: '',
      zip: '',
      style: 'fitted',
      size: 'M',
    };
  }
  componentDidMount() {
    this.props.cardElement.mount('.Stripe');
  }
  componentWillUnmount() {
    this.props.cardElement.unmount('.Stripe');
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    const {name, size, style, city, state, address1, address2, zip} = this.state;
    this.props.onSubmit({
      shirt: {
        artwork: document.querySelector('canvas').toDataURL(),
        style,
        size,
      },
      address: {
        name,
        city,
        state,
        address1,
        address2,
        zip,
      },
    });
  }

  handleChange = (name) => (e) => {
    if (name === 'style') {
      this.props.onStyleChange(e.target.value);
    }
    this.setState({[name]: e.target.value});
  }
  renderStyles() {
    return (
      <FormGroup controlId="style">
        <ControlLabel>Shirt style</ControlLabel>
        {[['fitted', 'Fitted (Next Level Boyfriend Tee)'], ['unisex', 'Unisex (Next Level Crew)']].map((style) => (
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
    const {disabled, error, orderErrors} = this.props;
    return (
      <form className="App-form" onSubmit={this.handleSubmit}>
        {orderErrors.length ? (
          <ListGroup>
            {orderErrors.map((error) => {
              return <ListGroupItem bsStyle="danger">{error && error.message}</ListGroupItem>
            })}
          </ListGroup>
        ) : ''}
        {this.renderStyles()}
        {this.renderSizes()}
        <FormGroup controlId="address">
          <ControlLabel>Shipping address</ControlLabel>
          <FormControl
            type="text"
            name="name"
            autoComplete="name"
            value={this.state.name}
            placeholder="Jenny Rosen"
            onChange={this.handleChange('name')}
            required
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="address1"
            value={this.state.address1}
            placeholder="185 Berry St"
            onChange={this.handleChange('address1')}
            required
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
            required
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="state"
            value={this.state.state}
            placeholder="CA"
            onChange={this.handleChange('state')}
            required
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            name="zip"
            value={this.state.zip}
            placeholder="94107"
            onChange={this.handleChange('zip')}
            required
          />
        </FormGroup>
        <FormGroup controlId="card" validationState={error && 'error'}>
          <ControlLabel>Card details</ControlLabel>
          <div className="Stripe form-control" id="card" />
          <HelpBlock>{error && error.message}</HelpBlock>
        </FormGroup>
        <Button type="submit" bsStyle="primary" bsSize="large" disabled={disabled} block>
          <Glyphicon glyph={disabled ? 'refresh' : 'shopping-cart'} bsClass={disabled ? 'spinning glyphicon' : 'glyphicon'} />{' '}
          {disabled ? 'Processing...' : 'Buy now'}
        </Button>
      </form>
    );
  }
}
