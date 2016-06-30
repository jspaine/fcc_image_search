const monk = require('monk')
const wrap = require('co-monk')

const db = monk('localhost/image_search')
const recent = wrap(db.get('recent'))

module.exports.recent = recent