const co = require('co')
const app = require('./app')
const request = require('co-supertest').agent(app.listen())
const {expect} = require('chai')
const {recent} = require('./db')

describe('search feature', () => {
  beforeEach(removeAll)

  it('should return search results', done => {
    request.get('/api/imagesearch/cats')
      .expect('Content-Type', /json/)
      .expect(res => expect(res.text).to.contain('Cats'))
      .expect(200, done)
  })

  it('should add search term to recent collection', done => {
    co(function *() {
      yield request.get('/api/imagesearch/dogs')
      const recentQuery = yield recent.find({})
      expect(recentQuery[0].term).to.equal('dogs')
    }).then(done)
  })

})

describe('recent searches feature', () => {
  beforeEach(removeAll)

  it('should show list of recent searches', done => {
    co(function *() {
      yield recent.insert({
        term: 'test',
        when: 1355270400000
      })
      yield recent.insert({
        term: 'test2',
        when: 1386806400000
      })
      yield recent.insert({
        term: 'test3',
        when: 1418342400000
      })
      yield request.get('/api/latest/imagesearch')
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.text).to.contain('test')
          expect(res.text).to.contain('Wed, 12 Dec 2012 00:00:00 GMT')
        })
        .expect(200)
    }).then(done)
  })
})

function removeAll(done) {
  co(function *() {
    yield recent.remove({})
  }).then(done)
}