const micro = require('micro')

module.exports = async (req, res) => {
  console.log(req.body);
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.writeHead(200)
  res.end('woot')
}
