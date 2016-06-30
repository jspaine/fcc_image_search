const monk = require('monk')
const wrap = require('co-monk')
const {conf} = require('./helpers')

const db = monk(conf('MONGODB_URI'))
const recent = wrap(db.get('recent'))

module.exports.recent = recent