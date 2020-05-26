const express = require("express");
const histStateDashboardRouter = express.Router();
const histStateDataSchema = require('./schemaHistCWSummary');


histStateDashboardRouter.get('',(req, res) => {
    jsonMessage = {};
    jsonMessage.message = "getting state level historical data"
    qryString = {};
    qryString.currentstatus = "Hospitalized"
    qry = histStateDataSchema.find(qryString).select('date statecode currentstatus cases -_id').sort({date: "desc", cases: "desc"})
    qry.exec((err, dbRecords) => {
        //console.log(dbRecords.slice(0,10));
        jsonMessage.recordsFound = dbRecords.length;
        res.status(201).json(jsonMessage);
    })

    
    
    async function myHandler() {
        const distinctDates = await getDistinctDates(histStateDataSchema);
        //console.log("top date", distinctDates[distinctDates.length -1]);
        //console.log(qr);

        if(distinctDates[distinctDates.length-1] === 'undefined/undefined/') {
            distinctDates.pop()
        }
        //console.log(distinctDates);

        for (let index=0; index < 10; index++) {
            //console.log("looping date", distinctDates[index]);
            //var matchQuery = queryBuilder(distinctDates[index]);
            const resPromises = await asofDateCases(histStateDataSchema, distinctDates[index]);
            const res = await Promise.all(resPromises);
            console.log(res);
        }
        
       
        
        
    }
    
    
    //queryBuilder('2020/02/01');
    myHandler();
    

}) //end of get

async function getDistinctDates(schema) {
    return new Promise((resolve, reject) => {
        schema.find().distinct('date', (err, dates) => {
            if(!err) {
                resolve(dates);
            } else {
                reject (err);
            }
        })

    })
}


async function asofDateCases(schema, date) {
    matchQuery = {};
    matchQuery.$match = {};
    //matchQuery.$match.currentstatus = "Hospitalized";
    matchQuery.$match.date ={};
    matchQuery.$match.date.$lte = date;
    //console.log(matchQuery)
    return new Promise((resolve, reject) => {
        q = schema.aggregate(
            [
                //{$match: {currentstatus: 'Hospitalized', statecode: 'TN', date: { '$lte': date } } },
                matchQuery,
                {$group: {_id: {date: date, state: "$statecode"}, cases: {$sum: "$cases"}}}
            ]
        )
        q.exec((err, res) => {
            if(!err) {
                resolve(res)
            } else {
                reject(err);
            }
        })
    })
    
}


async function queryBuilder(date){
/* 
structure:
{$match: {currentstatus: 'Hospitalized', date: { '$lte': '2020/02/01' } } },
{$group: {_id: {date: "$currentdate", state: "$statecode"}, cases: {$sum: "$cases"}}}
*/
    matchQuery = {};
    matchQuery.$match = {};
    //matchQuery.$match.currentstatus = "Hospitalized";
    matchQuery.$match.date ={};
    matchQuery.$match.date.$lte = date;

    groupQuery={};
    groupQuery.$group={};
    groupQuery.$group._id = {};
    groupQuery.$group._id.date = '$currentdate';
    groupQuery.$group._id.state = "$statecode";
    groupQuery.$group.cases = {};
    groupQuery.$group.cases.$sum = "$cases"; 

    //console.log(matchQuery);
}

module.exports = histStateDashboardRouter;