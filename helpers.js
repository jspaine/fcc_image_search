let config = {
  API_KEY: process.env.API_KEY || '',
  CSE_ID: process.env.CSE_ID || '',
  PORT: process.env.PORT || '',
  MONGODB_URI: process.env.MONGODB_URI || ''
}

try {
  config = require('./config');
} catch (e) {}

module.exports.conf = conf

module.exports.genSearchURI = function(query) {
  const q = parseQueryString(query)
  const uri = `https://www.googleapis.com/customsearch/v1?searchType=image&num=10&start=${q.offset * 10 + 1}&fields=queries,items(link,snippet,image/thumbnailLink,image/contextLink)&key=${conf('API_KEY')}&cx=${conf('CSE_ID')}&q=${q.term}`
  return uri
}

function parseQueryString(str) {
  const els = str.split('?')
  const query = {
    offset: 0
  }

  if (!els.length) return null
  query.term = els.splice(0, 1)[0]

  els.forEach(el => {
    const param = el.split('=')
    query[param[0]] = param[1]
  })
  
  return query
}

function conf(k) {
  return config[k]
}