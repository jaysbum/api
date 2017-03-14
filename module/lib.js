exports.kue = require('kue')
exports.ui = require('kue-ui')
exports.fetch = require('node-fetch')
const crypto = require('crypto')
const express = require('express')
exports.pretty = require('express-prettify')
const WooCommerce = require('woocommerce')
var MagentoAPI = require('magento')
exports.Promise = require("bluebird")
exports.app = express()
exports.bodyParser = require('body-parser')
exports.moment = require('moment')
exports.request = require('request')
exports.querystring = require('querystring')
exports.http = require('http')

exports.woo = new WooCommerce({
  url: 'https://www.atcreative.co.th',
  ssl: true,
  consumerKey: 'ck_f12ade6e5641a2fc197b485962508d2d0f50ac58',
  secret: 'cs_10e062dec492f38c9de9e4e6e9a34da749653770'
})

exports.magento = new MagentoAPI({
  host: 'kingadgets.in.th',
  port: 80,
  path: '/api/xmlrpc/',
  login: 'jaysmaster',
  pass: '1234567890'
})

exports.createSignatureHash = (text, apiKey) => {
  return crypto.createHmac('sha256', apiKey).update(text).digest('hex');
}
