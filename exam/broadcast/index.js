'use strict'

require('v8-compile-cache')

// eslint-disable-next-line
require = require('esm')(module/*, options */)

process.env.DEBUG = '*'

require('./index.esm.js')
