const mongoose = require('mongoose');

const maintenanceFeesSchema = new mongoose.Schema({
    payer: {type: String, required: false},
    deposit: {type: String, required: false},
    amount: {type: String, required: false},
    validity: {type: String, required: false},
    remnant: {type: String, required: false}
});

const patentSchema = new mongoose.Schema({
    applicationNumber: {type: String, required: false}, // todo unique: true
    registrationNumber: {type: String, required: false},
    status: {type: Array, required: false},
    maintenanceFees: maintenanceFeesSchema
});

// const Patent = mongoose.model('Patent', patentSchema); todo why not working?

module.exports = mongoose.model('Patent', patentSchema);
