const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require('path')
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer()

// configuration =========================================== set the static
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000
// files location
app.use('/public', express.static(path.join(__dirname, 'public'), {fallthrough: false}))
// Handle Static File 404
app.use((err, req, res, next) => {
  if (err) {
    console.error(err)
  }
  res.sendStatus(404)
})

if (!isProduction) {
  // We require the bundler inside the if block because it is only needed in a
  // development environment. Later you will see why this is a good idea
  require('./bundle.js')()

  // Any requests to localhost:3000/build is proxied to webpack-dev-server
  app.all('/public/dist/*', (req, res) => {
    proxy.web(req, res, {target: 'http://localhost:8080'})
  })
}

proxy.on('error', e => {
  console.log('Could not connect to proxy, please try again...')
})

// mongoose.connect(process.env.DB_URL)

app.use(bodyParser.json())
app.use(bodyParser.json({type: 'application/vnd.api+json'}))
app.use(bodyParser.urlencoded({extended: true}))

// simulate PUT/DETELE Method
app.use(methodOverride('X-HTTP-Method-Override'))

// configure routes
app.use(require('./app/routes'))

// start app ===============================================
app.listen(port, () => {
  console.log(`Magic happens on port ${port}`)
})
