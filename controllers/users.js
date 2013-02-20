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
			} else {
				res.send({'error' : 'User Not Found'}, 404);
			}
  		});
	},
	index: function(req,res,next){
		db.Users.find({},{'__v': 1, '_id': 1, 'description': 1, 'name': 1, 'videoId': 1, 'facebook': 1},{sort:{name: 1}},function(err,doc){
			var ndoc = JSON.parse(JSON.stringify(doc));
			for(var i=0;i<ndoc.length;i++) {
				ndoc[i].votes = ndoc[i].__v;
				//if (ndoc[i].name === 'suspense')
					//ndoc[i]['votes'] = ndoc[i]['votes'] + 100;
			}
			return res.send(handle(err,ndoc));
		});
		// db.Users.list({}, function(err,doc){
		// 		var ndoc = JSON.parse(JSON.stringify(doc));
		// 		for(var i = 0; i<ndoc.length;i++) {
		// 		 	ndoc[i]['votes'] = ndoc[i]['votes'].length;
		// 		}
		// 		//return res.send(handle(err,ndoc));
		// 	return res.send(handle(err,doc));
		// });
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
			return res.send(handle(err,doc));
		});
	}
}