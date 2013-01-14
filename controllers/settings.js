var db = require('../models');
function handle(err,doc){
	if (err)
		return err;
	return doc;
}
module.exports = {
	/*
	 * Settings Operations
	 */
	index: function(req,res,next){
		db.Settings.list(function(err,doc){
			return res.send(handle(err,doc));
		});
	}
}