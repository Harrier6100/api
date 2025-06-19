const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const physpropSpecSchema = new Schema({
    _id: Number,
    productCode: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    customerCode: String,
    customerName: String,
    specs: [{
        propertyCode: String,
        propertyName: String,
        values: [Number],
        uom: String,
        numberSize: Number,
        decimalScale: Number,
        isTrancate: {
            type: Boolean,
            default: false,
        },
        isRequired: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        _id: false,
    }],
    remarks: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: Date,
    createdBy: String,
    createdById: String,
    updatedAt: Date,
    updatedBy: String,
    updatedById: String,
}, { versionKey: false });

physpropSpecSchema.index({
    productCode: 1,
    customerCode: 1,
}, { unique: true });

const sequenceSchema = new Schema({
    _id: String,
    number: Number,
}, { versionKey: false });

const sequences = mongoose.models.sequences
? mongoose.models.sequences
: mongoose.model('sequences', sequenceSchema);

physpropSpecSchema.pre('save', function (next) {
    if (this._id) {
        sequences.findById('physpropSpecs')
        .then(sequence => {
            if (sequence) {
                if (this._id > sequence.number) {
                    sequence.number = this._id;
                    sequence.save();
                }
            } else {
                sequences.create({
                    _id: 'physpropSpecs',
                    number: this._id,
                });
            }
        })
        .catch(err => {
            throw err;
        });
        return next();
    }

    sequences.findByIdAndUpdate(
        { _id: 'physpropSpecs' },
        { $inc: { number: 1 }},
        { new: true, upsert: true },
    )
    .then(sequence => {
        this._id = sequence.number;
        next();
    })
    .catch(err => {
        throw err;
    });
});

module.exports = mongoose.model('physpropSpec', physpropSpecSchema);