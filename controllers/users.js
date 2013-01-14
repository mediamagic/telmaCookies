var db = require('../models');
function handle(err,doc){
	if (err)
		return err;
	return doc;
}
module.exports = {
	/*
	 * User Operations
	 */
	load: function(req, res, next) {
		db.Users.get({_id:req.params.id},function(err,doc){
			if (doc) {
				req.user = doc;
				next();
				//fn(null, doc);
			} else {
				res.send({'error' : 'User Not Found'}, 404);
			}
  		});
	},
	index: function(req,res,next){
		db.Users.list(function(err,doc){
			var ndoc = JSON.parse(JSON.stringify(doc));
			for(var i = 0; i<ndoc.length;i++) {
			 	ndoc[i]['votes'] = ndoc[i]['votes'].length;
			}
			return res.send(handle(err,ndoc));
		});
	},
	create: function(req,res,next){
		var data = req.body;
		db.Users.add(data, function(err,doc){
			return res.send(handle(err,doc));
		});
	},
	show: function(req,res,next){
		return res.send(req.user);
	},
	update: function(req,res,next){
		var id = req.user.id;
		var data = req.body;
		db.Users.edit({_id:id}, data, function(err,doc){
			console.log('done editing user');
			return res.send(handle(err,doc));
		});
	}
}