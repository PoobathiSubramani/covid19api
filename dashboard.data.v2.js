const express = require("express");
const dashboardDataRouter = express.Router();

const CWDataSchema = require('./schemaCWSummary');
const stateDetailSchema = require('./schemaCovid19Data');
const stateSummarySchema = require('./schemaCovid19Data');
const cwSummarySchema = require('./schemaCovid19Data');
const cwDetailsSchema = require('./schemaCovid19Data');




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
  console.log('State Parameter: ', stateParam);
  filterState = {}
  dashboardJSON.message = "dashboard Data";
  /*
  if (stateParam) {
    filterState = {statecode: stateParam}
  } else {
    filterState = {}
  }
  */
  /*
  // statewide summary, not at the distric level data
  if(stateParam) {filterState = {currentstatus: "Hospitalized", statecode: stateParam}} else {filterState = {currentstatus: "Hospitalized"}}
  stateSummaryQuery = [{$match: filterState}, {$group: {_id: {statecode:"$statecode", status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
  const stateSummaryResultsPromise = await dashboardData(CWDataSchema, stateSummaryQuery)
  const stateSummary = await Promise.all(stateSummaryResultsPromise);
  //console.log("data resulsts: ", dashRes);
  const stateSummaryFormatted = await formatResults(stateSummary);
  console.log("state summary results", stateSummaryFormatted);
  */

  /* STATE Summary with district level data */
  if(stateParam) { //if there is a state filter, then we need to get the state wide results, including the districs
    filterStateSummary = {statecode: stateParam}
    filterStateDetails = {currentstatus: "Hospitalized", statecode: stateParam}

    /* just in case if we need to 'build' the json structure...
    id = {}
    id.statecode = '$statecode'
    id.status = '$currentstatus'
    cases = {}
    cases.$sum = '$cases'
    group = {}
    group._id = id;
    group.cases = cases;
    console.log('id', group);
    */

    //query the state level summary
    stateSummaryQuery = [{$match: filterStateSummary}, {$group: {'_id': {status: "$currentstatus"}, cases: {'$sum': "$cases"}}}]
    const StateSummaryPromise = await dashboardData(stateSummarySchema, stateSummaryQuery);
    const StateSummaryUnformatted = await Promise.all(StateSummaryPromise);
    //console.log("State Summary Data - unformatted: ", StateSummaryUnformatted);
    const stateSummary = await formatResultsSummary(StateSummaryUnformatted);
    console.log('State Summary - Formatted:', stateSummary);

    //stateSummaryQuery = [{$match: filterStateSummary}, {$group: group}]
    //console.log('State Summary Query: ', stateSummaryQuery);

    stateDetailsQuery = [{$match: filterStateDetails}, {$group: {_id: {name: "$district", status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
    //console.log('State Details Query: ', stateDetailsQuery);

    //get the distric level data for the state
    const stateDetailsPromise = await dashboardData(stateDetailSchema, stateDetailsQuery);
    const stateDetailsUnformatted = await Promise.all(stateDetailsPromise);
    //console.log("State Details Data - unformatted: ", stateDetailsUnformatted);
    const stateDetails = await formatResultsDetails(stateDetailsUnformatted);
    console.log('State Details - Formatted: ', stateDetails)

    dashboardJSON.details = stateDetails;  
    dashboardJSON.summary = stateSummary; 

  } else { //if the state param is blank - means we need to get the CW results
    filterCWSummary = {}
    filterCWDetails = {currentstatus: "Hospitalized"}

    cwSummaryQuery = [{$match: filterCWSummary}, {$group: {_id: {status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
    const cwSummaryPromise = await dashboardData(cwSummarySchema, cwSummaryQuery);
    const cwSummaryUnformatted = await Promise.all(cwSummaryPromise);
    console.log('CW Summary Data - Unformatted: ', cwSummaryUnformatted);
    const cwSummary = await formatResultsSummary(cwSummaryUnformatted);
    console.log('CW Summary - Formatted: ', cwSummary);

    cwDetailsQuery = [{$match: filterCWDetails}, {$group: {_id: {name:'$statecode', status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
    const cwDetailsPromise = await dashboardData(cwDetailsSchema, cwDetailsQuery);
    const cwDetailsUnformatted = await Promise.all(cwDetailsPromise);
    console.log('CW Details Data - Unformatted: ', cwDetailsUnformatted);
    const cwDetails = await formatResultsDetails(cwDetailsUnformatted);
    console.log('CW Details - Formatted: ', cwDetails);
    
    dashboardJSON.details = cwDetails;  
    dashboardJSON.summary = cwSummary; 


    /*
    cwSummaryQuery = [{$match: filterCW}, {$group: {_id: {statecode:"$statecode", status: "$currentstatus"}, cases: {$sum: "$cases"}}}]
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
    */
  }

  


  
  //dashboardJSON.totalConfirmed = cwSummaryFormatted[0].Hospitalized;
  //dashboardJSON.totalRecovered = cwSummaryFormatted[0].Deceased;
  //dashboardJSON.totalDeceased = cwSummaryFormatted[0].Deceased;
  
  
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

async function formatResultsSummary(dashData) {
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

async function formatResultsDetails(dashData) {
  const cleanedDataPromises = await dashData.map(async dataRow => {
    return (
        {
        name: dataRow._id.name, 
        //currentstatus: dataRow._id.status,
        confirmedCases: dataRow.cases                
        }
    )
  })
  const cleanedDashData = await Promise.all(cleanedDataPromises);
  return cleanedDashData;  
}


module.exports = dashboardDataRouter;