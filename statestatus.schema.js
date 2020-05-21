const mongoose = require("mongoose");

const StateStatusSchema = mongoose.Schema([{
  //_id: String,
	stateCode: String,
	currStatus: String,
	totalCases: Number
}])

module.exports = mongoose.model("countrylevelcase", CountrywideSchema);
//this exports the mongoose model