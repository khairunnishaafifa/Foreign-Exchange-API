var mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')

var server = require('../../app')
    , exchange = require('../../models/v1/exhange')

var expect = chai.expect
chai.use(chaiHttp)

let ccyId, excId

describe('Add Rate', function () {

    before(done => {
        chai.request(server)
            .post('/ccys')
            .send({
                fromCcy: 'USD',
                toCcy: 'GBP'
            })
            .end(function (err, res) {
                ccyId = res.body.result._id
                exchange.deleteMany({},
                    { new: true }
                ).exec(() => {
                    done()
                })
            })
    })

    it("add rate should show OK", function (done) {
        chai.request(server)
            .post('/exchanges')
            .send({
                fromCcy: 'USD',
                toCcy: 'GBP',
                date: '2019-09-09',
                rate: '0.75709'
            })
            .end(function (err, res) {
                console.log(res.body)
                excId = res.body.result._id
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add rate with unexist currency should show FAILED", function (done) {
        chai.request(server)
            .post('/exchanges')
            .send({
                fromCcy: 'ABC',
                toCcy: 'ABC',
                date: '2019-09-09',
                rate: '0.75709'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add rate with invalid input should show FAILED", function (done) {
        chai.request(server)
            .post('/exchanges')
            .send({
                fromCcy: 'USD',
                toCcy: 'GBP',
                date: '2019-09-09',
                rate: 'abc'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("it should delete currency and exchange", function (done) {
        chai.request(server)
            .delete(`/ccys/${ccyId}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Update Exchange', function () {

    it("update rate should show OK", function (done) {
        chai.request(server)
            .put(`/exchanges/${excId}`)
            .send({
                date: '2019-10-09'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("update with invalid format rate should show FAILED", function (done) {
        chai.request(server)
            .put(`/exchanges/${excId}`)
            .send({
                rate: 'abc'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Delete Exchange', function () {

    after(function () {
        mongoose.connection.close();
    })

    it("delete rate should show OK", function (done) {
        chai.request(server)
            .delete(`/exchanges/${excId}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })
})