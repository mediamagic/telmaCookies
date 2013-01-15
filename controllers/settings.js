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
			doc.token = res.locals.token;
			return res.send(handle(err,doc));
		});
	},
	update: function(req,res,next){
		var id = req.params.id;
		var data = req.body;
		db.Settings.edit({_id:id}, data, function(err,doc){
			return res.send(handle(err,doc));
		});
	}
}