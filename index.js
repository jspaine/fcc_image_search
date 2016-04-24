var http = require('http');
var https = require('https');
var url = require('url');

var recent = [];
var config;

try {
  config = require('./config');
} catch (e) {
  config = {
    API_KEY: process.env.API_KEY,
    CSE_ID: process.env.CSE_ID
  };
}

var recent = [];

http.createServer(function(req, res) {
  var urlPath = url.parse(req.url).pathname;
  var searchString = urlPath.match(/^\/api\/imagesearch\/(.+)$/);

  if (searchString) {
    var query = parseQueryString(searchString[1]);
    updateRecent(query);

    request(query, function(err, data) {
      if (err) return showJson({error: err});
      if (!data || !data.items) return showJson([]);
      
      showJson(data.items.map(function(d) {
        return {
          url: d.link,
          snippet: d.snippet,
          thumbnail: d.image.thumbnailLink,
          context: d.image.contextLink
        };
      }));
    });
  } else if (urlPath === '/api/latest/imagesearch') {
    showJson(recent.reverse());
  } else {
    res.writeHead(404);
    res.write(urlPath + ' not found');
    res.end();
  }

  function showJson(data) {
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.write(JSON.stringify(data));
    res.end()
  }
}).listen(process.env.PORT || 8000);


function parseQueryString(queryStr) {
  var elements = queryStr.split('?');
  var query = {
    offset: 1
  };
  if (elements.length < 1) return null;

  query.term = elements.splice(0, 1)[0];
  if (elements.length > 0) {
    elements.forEach(function(el) {
      var param = el.split('=');
      if (param.length === 2)
        query[param[0]] = param[1];
    });
  }

  return query;
}

function request(query, cb) {
  if (!query) return cb('No query supplied');
  var queryString = 'searchType=image&num=10&start=' + (query.offset * 10 + 1) + 
    '&fields=queries,items(link,snippet,image/thumbnailLink,image/contextLink)&key=' + 
    config.API_KEY + '&cx=' + config.CSE_ID + '&q=' + query.term;

  https.request({
    hostname: 'www.googleapis.com',
    path: '/customsearch/v1?' + queryString
  }, function(res) {
    var data = '';
    if (res.statusCode !== 200) cb(res.statusCode + ' request failed');

    res.on('data', function(d) {
      data += d;
    });

    res.on('end', function() {
      cb(null, JSON.parse(data));
    });
  }).end();
}

function updateRecent(query) {
  recent.push({
    term: decodeURIComponent(query.term),
    when: new Date().toUTCString()
  });
  if (recent.length >= 11)
    recent.splice(0, recent.length - 10);
}
