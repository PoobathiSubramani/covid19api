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

  //CW data
  if(stateParam) {filterState = {statecode: stateParam}} else {filterState = {}}
  cwSummaryQuery = [{$match: filterState}, {$group: {_id: {status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
  const cwSummaryResultsPromise = await dashboardData(CWDataSchema, cwSummaryQuery)
  const cwSummary = await Promise.all(cwSummaryResultsPromise);
  //console.log("cw resulsts: ", cwSummary);
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