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



app.post('/order', (req, res, next) => {
  const r = request.post({
    url: `${ SP_API }design`,
    auth: {
      user: '',
      password: SP_AUTH,
    },
    json: true,
  }, (err, response, body) => {
    if (err) {
      return next(err);
    } else if (response.statusCode >= 300) {
      return next(body.message);
    }

    res.send(body);
  });

  const artUri = req.body.shirt.artwork;
  const artBuffer = new Buffer(artUri.split(',')[1], 'base64');

  const form = r.form();
  form.append('type', 'dtg');
  const fs = require('fs');
  form.append('sides[front][artwork]', artBuffer, {
    filename: 'artwork.png',
    contentType: 'image/png',
  });
  form.append('sides[front][dimensions][width]', '9.5'); // inches
  form.append('sides[front][position][horizontal]', 'C');
  form.append('sides[front][position][offset][top]', '2.5'); // inches
});

app.use('/static', express.static(path.join(__dirname, '../build/static')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).send(err.stack || err);
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on port ${ server.address().port }`)
});
