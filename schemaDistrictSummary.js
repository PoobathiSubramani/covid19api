const mongoose = require("mongoose");

const DistrictSummarySchema = mongoose.Schema([{
	statecode: String,
	district: String,
	currentstatus: String,
	cases: Number
}])

module.exports = mongoose.model("districtsummarycollection", DistrictSummarySchema);