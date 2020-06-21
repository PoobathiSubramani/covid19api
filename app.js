const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

const ingestDataRoute = require('./ingestData.v3');



//const rawdataRoute = require("./rawdataAPIv1");
//const batchDataRoute = require("./batchdata");
//const historicalDataRoute = require('./historicalDataRouter');
const histStateDashboardRoute  = require('./dash.histstatedata.v1');
//const dataAggregationRoute = require('./aggData');
const dashboardDataRoute = require('./dashboard.data.v2')
//const analysisDataRoute = require('./analysis');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

dbConnectionStatus = "not connected to DB";

dbConnectionString = "mongodb://"+
process.env.MONGODB_DBUSER+":"+
process.env.MONGODB_DBPWD+"@"+
process.env.MONGODB_CLUSTER+"/"+
process.env.MONGODB_DBNAME+"?"+"ssl=true&"+"retryWrites=true&w=majority";
//"@boomongocluster-rcqr2.azure.mongodb.net/node-angular?retryWrites=true&w=majority"

//dbConnectionString = "mongodb+srv://dbuser:dbpwd09@boomongocluster-rcqr2.azure.mongodb.net/covid19db";//?retryWrites=true&w=majority"

mongoose
  .connect(
    dbConnectionString,
    {useNewUrlParser: true, useUnifiedTopology: true} //added as per deprication warnings
  )
  .then(() => {
    console.log('Connection to db successful')
    dbConnectionStatus = "connected to DB";
  })
  .catch((err) => {
    console.error("Connection error with DB: " ,err);
  });

  app.get("", (req, res) => {
    res.send({Message:"Server initialized and... " + dbConnectionStatus});
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/ingest", ingestDataRoute);
//app.use("/rawdata", rawdataRoute);
//app.use("/agg", dataAggregationRoute);
app.use("/dash", dashboardDataRoute);
app.use("/dashhist", histStateDashboardRoute);
//app.use("/hist", historicalDataRoute);
//app.use("/batch", batchDataRoute);
//app.use("/ana", analysisDataRoute);



module.exports=app;