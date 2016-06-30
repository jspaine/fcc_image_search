const co = require('co')
const request = require('co-request')
const {genSearchURI} = require('./helpers')
const {recent} = require('./db')

module.exports.search = function *(query) {
  const uri = genSearchURI(query)
  const result = yield request({ 
    uri, 
    method: 'GET' 
  })
  updateRecent(query)
  const {items} = JSON.parse(result.body)
  
  this.body = items.map(it => ({
    url: it.link,
    snippet: it.snippet,
    thumbnail: it.image.thumbnailLink,
    context: it.image.contextLink
  }))
}

module.exports.latest = function *() {
  const queries = yield recent.find({}, {
    fields: { _id: 0 },
    sort: { when: -1 },
    limit: 10
  })
  this.body = queries.map(q => ({
    term: q.term,
    when: new Date(parseInt(q.when)).toUTCString()
  }))
}

function updateRecent(query) {
  co(function *() {
    yield recent.insert({
      term: query,
      when: Date.now()
    })
  })
}