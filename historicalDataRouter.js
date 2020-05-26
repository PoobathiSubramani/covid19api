const express = require("express");
const histStateDataRouter = express.Router();

const rawData = require('./rawdata.schema');
const histStateDataSchema = require('./histstatedata.schema');

var histStateData = [];
var histStateDataRow = {
    date: Date,
    stateCode: String,
    confirmedCases: Number
};

var filter = {currentstatus: "Hospitalized", statecode: "OR"} /* IMPORTANT TO UPDATE THIS FILTER */

histStateDataRouter.get('',(req,res) => {
    console.log("Entering historical state data router");

    rawData.aggregate(
        [
            {$match: filter},
            {$group: {_id: {date: "$dateannounced", stateCode: "$statecode"}, confirmedCases: {$sum: "$totalCases"}}}
        ]
    ).exec((err, aggRows) => {
        /* strcture of aggRows
        [ { _id: { date: '05/04/2020', stateCode: 'OR' },confirmedCases: 0 },
            { _id: { date: '09/05/2020', stateCode: 'OR' }, confirmedCases: 0 }]
        */
        aggRows.forEach(aggRow => {
            var dateParts = aggRow._id.date.split("/");
            var myDateString = dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0]
            //var myDate = new Date(Number(dateParts[2]), Number(dateParts[1])-1, Number(dateParts[0])+1, 0, 0, 0, 0); //+1/-1 only works. please check why that behavior
            
            //console.log(aggRow._id.date, dateParts, myDateString);
            histStateDataRow.date = myDateString,
            histStateDataRow.stateCode = aggRow._id.stateCode,
            histStateDataRow.confirmedCases = aggRow._id.confirmedCases
            histStateData.push(histStateDataRow);
        })
        //console.log(histStateData);
        manageHistStateCollection(histStateData, res);
    })
    
})

async function manageHistStateCollection(inputDataset, res) {
    dbMessages = {};
    dbMessages.message = "hist state collection"
    await histStateDataSchema.deleteMany({}, (err, deletedRecords) => {
        if(err) {throw(err)};
        {console.log('records deleted from histstate table: ', deletedRecords.n)}
        dbMessages.deletedRecords = deletedRecords.n;
    });
    await histStateDataSchema.insertMany(inputDataset, (err, insertedRecords) => {
        if(err) {throw(err)};
        {console.log("records inserted into histstate table: ", insertedRecords.length)}
        dbMessages.insertedRecords = insertedRecords.length;
        res.status(201).json(dbMessages);
    });
    
}

module.exports=histStateDataRouter;