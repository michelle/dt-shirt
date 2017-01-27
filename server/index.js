const express = require('express');
const path = require('path');

const app = express();
app.post('/order', (req, res) => {
  res.send('hello');
});

app.use('/static', express.static(path.join(__dirname, '../build/static')));
app.use((req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on port ${ server.address().port }`)
});
