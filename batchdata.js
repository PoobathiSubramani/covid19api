const rawData = require('./rawdata.schema');
const express = require("express");
const batchDataRouter = express.Router();
const request = require('request-promise');

batchDataRouter.get('', (req, res) => {
    console.log("Entering batch record service...");
    async function checkBatchDataRecords() {
        /*
        AWAIT below makes all the queries inside the PROMISE block to complete
        */
        const [batch1, batch2, batch3] = 
        await Promise
            .all ([
                rawData.find({databatch: 1}).exec(),
                rawData.find({databatch: 2}).exec(),
                rawData.find({databatch: 3}).exec()
            ])
        console.log("batch records: ", batch1.length, batch2.length, batch3.length);
        return [batch1.length, batch2.length, batch3.length];
    }
    
    async function loadBatchData(i) {
        const covid19DataURLs = [
            "dummy", //placeholder to make the 0th position dummy
            "https://api.covid19india.org/raw_data1.json",
            "https://api.covid19india.org/raw_data2.json",
            "https://api.covid19india.org/raw_data3.json"
        ];
    
        //set the URL and variables for the REQUEST call
        var requestOptions = {
            uri: covid19DataURLs[i],
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        };
    
        await request(requestOptions)
            .then(function(apiResponse) {
                batchData = apiResponse.raw_data;
                for (const index in batchData) {
                    batchData[index].databatch=i;
                }
                rawData.insertMany(batchData, (err, docs) => {
                    if(err) throw(err);
                    console.log("Records inserted in batch: ", i, docs.length);
                });
            });
    
    }
    
    async function loadBatchDataIfNotExistsAlready() {
    
        const [b1, b2, b3] = await checkBatchDataRecords()
        //console.log("batch here:", b1, b2, b3);
    
        if(b1 === 0 ) {loadBatchData(1)};
        if(b2 === 0 ) {loadBatchData(2)};
        if(b3 === 0 ) {loadBatchData(3)};

        res.status(201).json({message: "Batch data service", batch1: b1, batch2: b2, batch3: b3});
    }
    
    loadBatchDataIfNotExistsAlready();
    
})

module.exports=batchDataRouter;