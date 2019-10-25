const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    list_user: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                require: true,
                ref: 'User'
            }
        }
    ],
    create_date: {
        type: Date,
        default: Date.now()
    },
    update_date: {
        type: Date,
        default: ""
    },
    delete_date: {
        type: Date,
        default: ""
    }
}, {collection: 'trip'});

tripSchema.path('name').set((inputString) => {
    return inputString[0].toUpperCase() + inputString.slice(1);
});
module.exports = mongoose.model('trip', tripSchema);
