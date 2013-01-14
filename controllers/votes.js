var db = require('../models');
function handle(err,doc){
	if (err)
		return err;
	return doc;
}
module.exports = {
	load: function(req, id, fn){
		db.Users.get({_id:id},function(err,doc){
			if (doc) {
				fn(null, doc);
			} else {
				switch (req.params.format) {
					case 'json':
						req.res.json({'error' : 'User Not Found'}, 404);
						break;
					case 'html':
					default:
						req.res.send(404);
				}
			}
  		});
	},
	show: function(req,res,next){
		res.send(req.vote.votes);
	},
	create: function(req,res,next){
		console.log('here');
		// var data = req.body;
		// data.voterIp = (req.headers['x-forwarded-for']) ? 
		// 	req.headers['x-forwarded-for'] : 
		// 	req.connection.remoteAddress;
		// db.Users.vote({_id:req.user._id}, data, function(err,doc){
		// 	if (err)
		// 		return res.send(err);
		// 	//io.sockets.emit('updateStats', {user:req.user._id, votes: doc.votes.length});
		// 	return res.send(handle(err,doc));
		// });
		return res.send('ok');
	}
}