import React, { Component } from 'react';
import './App.css';
import Checkout from './Checkout';
import Shirt from './Shirt';
import {Grid, Row, Col, PageHeader} from 'react-bootstrap';

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
          dt-shirt
          {' '}
          <small>
            a t-shirt with the current datetime.
          </small>
        </PageHeader>
        <Row>
        <Col sm={7}>
          <Shirt shirtStyle={this.state.style} />
        </Col>
        <Col sm={5}>
          <Checkout onStyleChange={this.handleStyleChange} />
        </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
