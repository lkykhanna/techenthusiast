const mongoose = require('mongoose')

const addProductsSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    src: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: String, required: true},
    purchaseStatus: {type: Boolean, required: true, default:false}
}, {
    collection: 'addProducts'
})

const model = mongoose.model('addProducts', addProductsSchema)

module.exports = model