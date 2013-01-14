var db = require('../models');
function handle(err,doc){
	if (err)
		return err;
	return doc;
}
module.exports = {
	create: function(req,res,next){
		var data = req.body;
		data.voterIp = (req.headers['x-forwarded-for']) ? 
			req.headers['x-forwarded-for'] : 
			req.connection.remoteAddress;
		db.Users.vote({_id:req.params.id}, data, function(err,doc){
			if (err)
				return res.send(err);
			return res.send(handle(err,doc));
		});
	}
}