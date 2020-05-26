const express = require("express");
const dashboardDataRouter = express.Router();

const CWDataSchema = require('./schemaCWSummary');


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
  //console.log("received request: ", req);
  /*
  queryParams = req.query;
  console.log("params", queryParams);
  filterState = queryParams.st;
  */
/*
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
              {$match: {currentstatus: "Hospitalized"}},
              {$group: {_id: {}, confirmedCases: {$sum: "$cases"}}}
            ]
          ).exec(),
          CWDataSchema.aggregate(
            [
              {$match: {currentstatus: "Recovered"}},
              {$group: {_id: {}, recoveredCases: {$sum: "$cases"}}}
            ]
          ).exec(),
          CWDataSchema.aggregate(
            [
              {$match: {currentstatus: "Deceased"}},
              {$group: {_id: {}, deceasedCases: {$sum: "$cases"}}}
            ]
          ).exec(),
          CWDataSchema.aggregate(
            [
              {$match: {currentstatus: "Hospitalized"}},
              {$group: {_id: {stateCode: "$statecode"}, confirmedCases: {$sum: "$cases"}}}
            ]
          ).exec()
        ])
      
      
      structure of h 
      [ { _id: {}, confirmedCases: 112109 } ]
       

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
*/
//buildSummaryDataForDashboard();

async function asyncHandler() {
  stateParam = req.query.st;
  filterState = {}
  /*
  if (stateParam) {
    filterState = {statecode: stateParam}
  } else {
    filterState = {}
  }
  */
  //console.log(filterState);
  if(stateParam) {filterState = {currentstatus: "Hospitalized", statecode: stateParam}} else {filterState = {currentstatus: "Hospitalized"}}
  stateSummaryQuery = [{$match: filterState}, {$group: {_id: {statecode:"$statecode", status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
  const stateSummaryResultsPromise = await dashboardData(CWDataSchema, stateSummaryQuery)
  const stateSummary = await Promise.all(stateSummaryResultsPromise);
  //console.log("data resulsts: ", dashRes);
  const stateSummaryFormatted = await formatResults(stateSummary);
  console.log("state summary results", stateSummaryFormatted);

  if(stateParam) {filterState = {statecode: stateParam}} else {filterState = {}}
  cwSummaryQuery = [{$match: filterState}, {$group: {_id: {status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
  const cwSummaryResultsPromise = await dashboardData(CWDataSchema, cwSummaryQuery)
  const cwSummary = await Promise.all(cwSummaryResultsPromise);
  console.log("cw resulsts: ", cwSummary);
  const cwSummaryFormatted = await formatResultsCW(cwSummary);
  console.log("cw results", cwSummaryFormatted);

  dashboardJSON.message = "dashboard Data";
  //dashboardJSON.totalConfirmed = cwSummaryFormatted[0].Hospitalized;
  //dashboardJSON.totalRecovered = cwSummaryFormatted[0].Deceased;
  //dashboardJSON.totalDeceased = cwSummaryFormatted[0].Deceased;
  dashboardJSON.statedata = stateSummaryFormatted;  
  dashboardJSON.cwdata = cwSummaryFormatted; 
  
  res.status(201).json(dashboardJSON);
}

asyncHandler();
  
}) 

async function dashboardData(schema, query) {
  return new Promise((resolve, reject) => {
    schema.aggregate(query).exec((err, result) => {
      if(!err) {
        resolve(result);
      } else {
        reject(err);
      }
    })
  })
}

async function formatResults(dashData) {
  const cleanedDataPromises = await dashData.map(async dataRow => {
    return (
        {
        stateCode: dataRow._id.statecode, 
        currentstatus: dataRow._id.status,
        confirmedCases: dataRow.cases                
        }
    )
  })
  const cleanedDashData = await Promise.all(cleanedDataPromises);
  return cleanedDashData;  
}

async function formatResultsCW(dashData) {
  cw = {};
  const cleanedDataPromises = await dashData.map(async dataRow => {
    return (
      {
        status: dataRow._id.status,
        cases: dataRow.cases
      }
    )
  })
  const cleanedDashData = await Promise.all(cleanedDataPromises);
  //console.log(cleanedDashData);
  return cleanedDashData;  
}


module.exports = dashboardDataRouter;