'use strict'
const dotenv = require('dotenv')

dotenv.config()

const lambdFunc = require('../lambda/index')

lambdFunc.handler({}, null, (err, data) => {
  if (err) console.error(err)
  else console.log(JSON.stringify(data, null, 2))
})
