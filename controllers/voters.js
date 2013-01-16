var db = require('../models');
function handle(err,doc){
	if (err)
		return err;
	return doc;
}
module.exports = {
	load: function(req, res, next) {
		db.Voters.get({_id:req.params.id},function(err,doc){
			if (doc) {
				req.voter = doc;
				next();
			} else {
				res.send({'error' : 'User Not Found'}, 404);
			}
  		});
	},
	index: function(req,res,next){
		db.Voters.list(req.query, function(err,doc){
			return res.send(handle(err,doc));
		});
	},
	show: function(req,res,next){
		return res.send(req.voter);
	},
	create: function(req,res,next){
		var data = req.body;
		db.Voters.add(data, function(err,doc){
			return res.send(handle(err,doc));
		});
	},
	update: function(req,res,next){
		var data = req.body;
		db.Voters.edit(req.voter._id, data, function(err,doc){
			return res.send(handle(err,doc));
		});
	}
}