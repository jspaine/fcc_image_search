const koa = require('koa')
const route = require('koa-route')
const {conf} = require('./helpers')
const apiRoutes = require('./apiRoutes')

const app = module.exports = koa()

app.use(route.get('/api/imagesearch/:query', apiRoutes.search))
app.use(route.get('/api/latest/imagesearch', apiRoutes.latest))

app.listen(conf('PORT'))
console.log('Listening on port', conf('PORT'))