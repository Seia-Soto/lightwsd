'use strict'

require('v8-compile-cache')

// eslint-disable-next-line
require = require('esm')(module/*, options */)

module.exports = require('./index.esm.js')
