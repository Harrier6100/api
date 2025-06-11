const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const physpropNameSchema = new Schema({
    _id: Number,
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    uom: String,
    numberSize: Number,
    localizes: [{
        lang: String,
        name: String,
        uom: String,
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

const sequenceSchema = new Schema({
    _id: String,
    number: Number,
}, { versionKey: false });

const sequences = mongoose.models.sequences
? mongoose.models.sequences
: mongoose.model('sequences', sequenceSchema);

physpropNameSchema.pre('save', function (next) {
    if (this._id) {
        sequences.findById('physpropNames')
        .then(sequence => {
            if (sequence) {
                if (this._id > sequence.number) {
                    sequence.number = this._id;
                    sequence.save();
                }
            } else {
                sequences.create({
                    _id: 'physpropNames',
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
        { _id: 'physpropNames' },
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

module.exports = mongoose.model('physpropName', physpropNameSchema);