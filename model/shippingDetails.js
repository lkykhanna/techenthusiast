const mongoose = require('mongoose')

const shippingDetailsSchema = new mongoose.Schema({
    email: { type: String, required: true},
    phone: {type: Number, required: true},
    country: {type: String, required: true},
    adline1: {type: String, required: true},
    adline2: {type: String, required: true},
    postcode : {type: Number, required: true},
    city : {type: String, required: true}
}, {
    collection: 'shippingDetails'
})

const model = mongoose.model('shippingDetails', shippingDetailsSchema)

module.exports = model