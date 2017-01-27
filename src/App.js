import React, { Component } from 'react';
import './App.css';
import Checkout from './Checkout';
import Shirt from './Shirt';
import {Grid, Row, Col, PageHeader, Glyphicon} from 'react-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: 'fitted',
    };
  }

  handleStyleChange = (style) => {
    this.setState({style});
  }
  render() {
    return (
      <Grid>
        <PageHeader>
          <Glyphicon glyph="time" />
          {' '}
          dt-shirt
          {' '}
          <small>
            a t-shirt with the current datetime.
          </small>
        </PageHeader>
        <Row>
        <Col md={7} sm={6}>
          <Shirt shirtStyle={this.state.style} />
        </Col>
        <Col md={5} sm={6}>
          <Checkout onStyleChange={this.handleStyleChange} />
        </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
