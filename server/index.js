const express = require('express');
const path = require('path');
const request = require('request');
const bodyParser = require('body-parser');
const PassThrough = require('stream').PassThrough;

const app = express();

app.use(bodyParser.json({limit: '5mb'}));

const SP_API = 'https://api.scalablepress.com/v2/';
const SP_AUTH = process.env.SP_AUTH;

// {
//   shirt: {
//     size:,
//     style:,
//     artwork:,
//   },
//   stripeToken: ...,
//   address: {
//     street1:,
//     street2:,
//     city:
//     zipcode:,
//   }
// }

const PRODUCTS = {
  // fitted: 'bella-ladies-favorite-t-shirt', // 16.4
  fitted: 'next-level-boyfriend-tee', // 16.5
  unisex: 'next-level-fitted-crew', // 16.94
  //unisex: 'american-apparel-t-shirt',
  //unisex: 'american-apparel-50-50-t-shirt',
  //unisex: 'next-level-cvc-crew', // 17.16
  //unisex: 'canvas-v-neck-t-shirt', // 17.46
  //unisex: 'canvas-unisex-t-shirt', // 16.81
  //unisex: 'alternative-apparel-basic-crew-t-shirt', //18.36
};
const SIZES = {
  S: 'sml',
  M: 'med',
  L: 'lrg',
  XL: 'xlg',
};

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Content-Type', 'application/json');
  next();
});

const auth = {
  user: '',
  password: SP_AUTH,
};

app.post('/order', (req, res, next) => {
  const {shirt, address} = req.body;

  // CREATE DESIGNID
  const r = request.post({
    url: `${ SP_API }design`,
    auth,
    json: true,
  }, (err, response) => {

    console.log('DESIGN', response.body);
    if (err) {
      return next(err);
    } else if (response.body.statusCode > 300) {
      return next(response.body);
    } else {

      // CREATE ORDERTOKEN
      request.post({
        url: `${SP_API}quote`,
        auth,
        body: {
          type: 'dtg',
          products: [{
            id: PRODUCTS[shirt.style],
            color: shirt.style === 'fitted' ? 'Black' : 'Black',
            quantity: 1,
            size: SIZES[shirt.size],
          }],
          designId: response.body.designId,
          address,
        },
        json: true,
      }, (err, response) => {

        console.log('QUOTE', response.body);
        if (err) {
          return next(err);
        } else if (response.body.statusCode > 300 || (response.body.orderIssues && response.body.orderIssues.length)) {
          return next(response.body);
        } else {

          // CREATE ORDERID
          request.post({
            url: `${SP_API}order`,
            json: true,
            auth,
            body: {
              orderToken: response.body.orderToken,
            }
          }, (err, response) => {

            console.log('ORDER', response.body);
            if (err) {
              return next(err);
            } else if (response.body.statusCode > 300) {
              return next(response.body);
            } else {
              res.json({order: response.body.orderId});
            }
          });
        }
      });
    }
  });

  const artUri = shirt.artwork;
  const artBuffer = new Buffer(artUri.split(',')[1], 'base64');

  const form = r.form();
  form.append('type', 'dtg');
  form.append('sides[front][artwork]', artBuffer, {
    filename: 'artwork.png',
    contentType: 'image/png',
  });
  form.append('sides[front][dimensions][width]', '8'); // inches
  form.append('sides[front][position][horizontal]', 'C');
  form.append('sides[front][position][offset][top]', '3'); // inches
});

app.use('/static', express.static(path.join(__dirname, '../build/static')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(400).send(err.stack || err);
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on port ${ server.address().port }`)
});
