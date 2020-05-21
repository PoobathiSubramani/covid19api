const express = require("express");
const aggDataRouter = express.Router();

const rawData = require('./rawdata.schema');
const CWDataSchema = require('./countrywide.schema');


aggDataRouter.get('', (req, res) => {
    console.log("Entering aggregated data service...");

    var CWAggData = [];
    /* USE THIS DISTRICT LEVEL AGGREGATION DATA LATER
    const agg = rawData.aggregate(
        [
          {$group: {_id: {state:"$statecode", district: "$detecteddistrict"}, totalCases: {$sum: "$numcases"}}}
        ]
      );
      agg.exec((err, aggresult) => {
        if(err) throw(err);
        aggresult.forEach(aggres => console.log(aggres));
      })
      */
      const aggCW = rawData.aggregate(
        [
          {$group: {_id: {stateCode:"$statecode", currStatus:"$currentstatus"}, totalCases: {$sum: "$numcases"} }}
        ]
      );
      aggCW.exec((err, aggResults) => {
        if(err) {
          throw(err)
        } else {
          aggResults.forEach(aggResult => {
            //console.log("countrywide: ", aggResult)
            //console.log(aggResult._id.stateCode);
            var stateData = { 
                stateCode:  aggResult._id.stateCode, 
                currStatus: aggResult._id.currStatus, 
                totalCases: aggResult.totalCases
              }
            CWAggData.push(stateData);
          });
          //console.log(CWAggData);
          //delete CW collection to refresh
          CWDataSchema.deleteMany({}, (err, delResults)=>{
            if(err) throw(err);
            console.log('Number of docs deleted from CW table: ', delResults.n);
          });
          //insert new docs in the countrylevel collection
          CWDataSchema.insertMany(CWAggData, (err, docs) => {
            if(err){
              throw(err)
            } else {
              console.log('Number of docs inserted from CW table: ', docs.length);
            }
          });
        }
      });
    
});

module.exports=aggDataRouter;