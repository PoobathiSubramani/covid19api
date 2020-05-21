const express = require("express");
const analysisDataRouter = express.Router();

const rawData = require('./rawdata.schema');

const converter = require('json-2-csv');
const fs = require('fs');

analysisDataRouter.get('', (req, res) => {
    console.log("entering analysis service");
    rawData.find({statecode:"GA"},(err, dataRows)=>{
        if (err) {throw(err);}
        else {
            console.log("number of rows: ", dataRows.length);
            dataRows.slice(0,1).forEach(dataRow => {
                d = JSON.stringify(dataRow);
                console.log(d);
            })
            converter.json2csv(dataRows, (err, csv) =>{
                if(err) throw(err);
                console.log(csv);
                fs.writeFile('/Users/boopathi/Learning/raw data.txt', csv, err => {
                    if (err) throw (err);
                    console.log('file saved');
                    res.status(201).json({message: "analysis data exported"});
                })
            }) 
        }
    })
})

module.exports=analysisDataRouter;