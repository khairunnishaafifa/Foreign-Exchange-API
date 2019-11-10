var chaiHttp = require('chai-http')
    , chai = require('chai')

var server = require('../../app')
    , currency = require('../../models/v1/currency')
    , exchange = require('../../models/v1/exhange')

var expect = chai.expect
chai.use(chaiHttp)

let ccyId

describe('Add Currency', function () {

    before(done => {
        currency.deleteMany({},
            { new: true }
        ).exec(() => {
            done()
        })
    })

    it("add currency should show OK", function (done) {
        chai.request(server)
            .post('/ccys')
            .send({
                fromCcy: 'GBP',
                toCcy: 'USD'
            })
            .end(function (err, res) {
                ccyId = res.body.result._id
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add currency one more time should show OK", function (done) {
        chai.request(server)
            .post('/ccys')
            .send({
                fromCcy: 'JPY',
                toCcy: 'IDR'
            })
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add currency with exist data should show FAILED", function (done) {
        chai.request(server)
            .post('/ccys')
            .send({
                fromCcy: 'JPY',
                toCcy: 'IDR'
            })
            .end(function (err, res) {
                expect(res).to.have.status(409)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add currency with invalid format 'from' should show FAILED", function (done) {
        chai.request(server)
            .post('/ccys')
            .send({
                fromCcy: 'JPYs',
                toCcy: 'IDR'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add currency with invalid format 'to' should show FAILED", function (done) {
        chai.request(server)
            .post('/ccys')
            .send({
                fromCcy: 'JPY',
                toCcy: 'IDRs'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Get Currency', function () {

    before(done => {
        exchange.deleteMany({},
            { new: true }
        ).exec(() => {
            done()
        })
    })

    before(done => {
        chai.request(server)
            .post('/exchanges')
            .send({
                fromCcy: 'GBP',
                toCcy: 'USD',
                date: '2019-09-09',
                rate: '1.417'
            })
            .end(function (err, res) {
                done()
            })
    })

    it("it should show currency by date", function (done) {
        chai.request(server)
            .get('/ccys/date')
            .send({
                date: '2019-09-09'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show currency by date when there is no data rate should show FAILED", function (done) {
        chai.request(server)
            .get('/ccys/date')
            .send({
                date: '2019-08-09'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should show detail currency", function (done) {
        chai.request(server)
            .get('/ccys')
            .send({
                fromCcy: 'GBP',
                toCcy: 'USD'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show detail currency with unexist fromCcy should show FAILED", function (done) {
        chai.request(server)
            .get('/ccys')
            .send({
                fromCcy: 'JPY',
                toCcy: 'USD'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("show detail currency with unexist toCcy should show FAILED", function (done) {
        chai.request(server)
            .get('/ccys')
            .send({
                fromCcy: 'GBP',
                toCcy: 'JPY'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Update Currency', function () {

    it("it should update currency", function (done) {
        chai.request(server)
            .put(`/ccys/${ccyId}`)
            .send({
                fromCcy: 'IDR'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update currency with invalid format fromCcy should show FAILED", function (done) {
        chai.request(server)
            .put(`/ccys/${ccyId}`)
            .send({
                fromCcy: 'IDRs'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update currency with invalid format toCcy should show FAILED", function (done) {
        chai.request(server)
            .put(`/ccys/${ccyId}`)
            .send({
                toCcy: 'IDRs'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Delete Currency', function () {

    after(() => {
        currency.deleteMany({},
            { new: true }
        ).exec()
    })

    it("it should delete currency", function (done) {
        chai.request(server)
            .delete(`/ccys/${ccyId}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })
})