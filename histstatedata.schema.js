const mongoose = require("mongoose");

const histStateDataSchema = mongoose.Schema([{
  	date: String,
	stateCode: String,
	totalCases: Number
}])

module.exports = mongoose.model("histstatecase", histStateDataSchema);
//this exports the mongoose model