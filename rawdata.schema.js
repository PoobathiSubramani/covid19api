const mongoose = require("mongoose");

const RawCovidDataJsonSchema = mongoose.Schema([{
  //_id: String,
  agebracket: String,
	contractedfromwhichpatientsuspected: String,
	currentstatus: String,
	dateannounced: String,
	detectedcity: String,
	detecteddistrict: String,
	detectedstate: String,
	entryid: String,
	gender: String,
	nationality: String,
	notes: String,
	numcases: Number,
	patientnumber: String,
	source1: String,
	source2: String,
	source3: String,
	statecode: String,
	statepatientnumber: String,
	statuschangedate: String,
	typeoftransmission: String,
	databatch: Number
}])

module.exports = mongoose.model("covid19RawDataCollection", RawCovidDataJsonSchema);
//this exports the mongoose model