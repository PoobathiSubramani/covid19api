const express = require("express");
const rawdataRouter = express.Router();

const rawData = require('./rawdata.schema');
const CWDataSchema = require('./countrywide.schema');

//the 'request' module used to call an API from another API 
const request = require('request-promise');
covid19DataURL = "https://api.covid19india.org/raw_data4.json";
//covid19DataURL = "http://localhost:3000/dash"

covid19DataURLs = [
    "dummy",
    "https://api.covid19india.org/raw_data1.json",
    "https://api.covid19india.org/raw_data2.json",
    "https://api.covid19india.org/raw_data3.json",
    "https://api.covid19india.org/raw_data4.json"
];


var i=1;
numberOfRows=0;
//qry = constructQuery(i);

rawdataRouter.get('', (req, res) => {
    var currentDataBatch = 4
    var CWAggData = [];

    const aggCW = rawData.aggregate(
        [
          {$group: {_id: {stateCode:"$statecode", currStatus:"$currentstatus"}, totalCases: {$sum: "$numcases"} }}
        ]
      );

    var requestOptions = {
        uri: covid19DataURLs[currentDataBatch],
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    request(requestOptions)
        .then(function(apiResponse) {
            /* 
            structure of rawdata
            {"raw_data":[{"agebracket":"","contractedfromwhichpatientsuspected":"","currentstatus":"Hospitalized....
            */
            rawData.deleteMany({databatch: 4}, (err, docs)=>{
                if(err) throw(err);
                console.log("total records deleted from raw data collection: ", docs.n);
                //docs has a specific structure. 
                //in that structure, 'n' is a value contains the number of records deleted.
            })

            apiData = apiResponse.raw_data;
            for (const index in apiData) {
                apiData[index].databatch=currentDataBatch;
            }
            //apiResponse.raw_data.push(dataBatch);
            rawData.insertMany(apiData, (err, docs) => {
                if(err) {
                  console.log(err);
                } else {
                    console.log("total records inserted into raw data collection: ", docs.length);
                    //docs is the actual array of docs that are inserted.
                    //So using 'length' to get the number of records inserted.

                    //once the raw records are inserted, do the aggregation updates
                    aggCW.exec((err, aggResults) => {
                        if(err) {
                          throw(err)
                        } else {
                          aggResults.forEach(aggResult => {
                            var stateData = { 
                                stateCode:  aggResult._id.stateCode, 
                                currStatus: aggResult._id.currStatus, 
                                totalCases: aggResult.totalCases
                              }
                            CWAggData.push(stateData);
                          });
                          CWDataSchema.deleteMany({}, (err, delResults)=>{
                            if(err) throw(err);
                            console.log('Number of docs deleted from CW table: ', delResults.n);
                          });
                          //insert new docs in the countrylevel collection
                          CWDataSchema.insertMany(CWAggData, (err, docs) => {
                            if(err){throw(err)} 
                            else { 
                                console.log('Number of docs inserted from CW table: ', docs.length);
                                res.status(201).json({message: "raw data inserted and summary tables updated."});
                            }

                          });
                        }
                      });
                }
            })

            //do the agg data insert here?
            
            
              

        })
    .catch(function(err) {console.log("api call failed:", err)});
    
});




module.exports=rawdataRouter;