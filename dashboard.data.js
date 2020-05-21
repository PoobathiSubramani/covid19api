const express = require("express");
const dashboardDataRouter = express.Router();

const CWDataSchema = require('./countrywide.schema');
const rawDataSchema = require('./rawdata.schema');

var dashboardJSON = {}; 
/* we need a structure like this
[{message: "dashboard data", 
  totalConfirmed: [{totalCases: 200}],
  totalDeceased: [{totalDesesed: 10}],
  totalRecovered: [{totalRecovered: 26}],
  cwdata: [{stateCode: TN, totalCases: 100}, {stateCode: KL, totalCases: 200}]  
}]
*/

dashboardDataRouter.get('', (req, res) => {
  async function buildSummaryDataForDashboard() {
    var CWAggDataByState = [];
    var confirmedCases=0;
    var recoveredCases=0;
    var deceasedCases=0;
  
    const [h, r, d, cwResults] =
      await Promise
        .all ([
          CWDataSchema.aggregate(
            [
              {$match: {currStatus: "Hospitalized"}},
              {$group: {_id: {}, confirmedCases: {$sum: "$totalCases"}}}
            ]
          ).exec(),
          CWDataSchema.aggregate(
            [
              {$match: {currStatus: "Recovered"}},
              {$group: {_id: {}, recoveredCases: {$sum: "$totalCases"}}}
            ]
          ).exec(),
          CWDataSchema.aggregate(
            [
              {$match: {currStatus: "Deceased"}},
              {$group: {_id: {}, deceasedCases: {$sum: "$totalCases"}}}
            ]
          ).exec(),
          CWDataSchema.aggregate(
            [
              {$match: {currStatus: "Hospitalized"}},
              {$group: {_id: {stateCode: "$stateCode"}, confirmedCases: {$sum: "$totalCases"}}}
            ]
          ).exec()
        ])
      
      /*
      structure of h 
      [ { _id: {}, confirmedCases: 112109 } ]
      */ 

      if(h.length === 1) {confirmedCases = h[0].confirmedCases};
      if(r.length === 1) {recoveredCases = r[0].recoveredCases};
      if(d.length === 1) {deceasedCases = d[0].deceasedCases};
  
      console.log("new dashboard summary: ", confirmedCases, recoveredCases, deceasedCases);
      
      await cwResults.forEach(cwResult => {
        var stateData = {
          stateCode: cwResult._id.stateCode,
          confirmedCases: cwResult.confirmedCases
        };
        CWAggDataByState.push(stateData);
      });
  
      cw = CWAggDataByState.map(data => ({stateCode: data.stateCode, confirmedCases: data.confirmedCases}));
      dashboardJSON.message = "dashboard Data";
      dashboardJSON.totalConfirmed = confirmedCases;
      dashboardJSON.totalRecovered = recoveredCases;
      dashboardJSON.totalDeceased = deceasedCases;
      dashboardJSON.cwdata = cw;      
      //console.log("inside dashbaord fn.", dashboardJSON);
      res.status(201).json(dashboardJSON);
  }

buildSummaryDataForDashboard();
  
}) 




module.exports = dashboardDataRouter;