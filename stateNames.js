const express = require('express');
const stateNamesRouter = express.Router();
const StateLookupSchema = require('./schemaStateLookup');


stateNamesRouter.get('', (req, res) => {
    console.log('Inside the stateName router API.');

    async function asyncHandler() {
        const stateNames = await getStateNames(StateLookupSchema);
        console.log('state names:', stateNames);
        res.status(201).json({stateNames});
    }
    asyncHandler();
})

async function getStateNames(schema) {
    return new Promise((resolve, reject) => {
        schema.find().distinct('state', (err, stateNames) => {
            if(err) {
                reject(console.log('Error with the promise while getting the state names', err));
            } else {
                resolve(stateNames);
            }
        })
    }).catch(err => {console.log('err...', err);})
}

module.exports = stateNamesRouter;