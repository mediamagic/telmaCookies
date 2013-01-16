var db = require('../models');
function handle(err,doc){
	if (err)
		return err;
	return doc;
}
module.exports = {
	/*
	 * Statistics Operations
	 */
	index: function(req,res,next){
		var type = req.params.type
		, model = '';
		if (type==='visit')
			model = 'Refs';
		else if (type==='share')
			model = 'Shares';
		else
			return res.send({error: 'no such endpoint'}, 404);
		db[model].list({}, function(err,doc){
			return res.send(handle(err,doc));
		});
	},
	create: function(req,res,next){
		var obj = req.body
		, type = req.params.type
		, model = '';
		if (type==='visit')
			model = 'Refs';
		else if (type==='share')
			model = 'Shares';
		else
			return res.send({error: 'no such endpoint'}, 404);
		db[model].upd(obj, {$inc: {count:1}}, {upsert:true}, function(err,doc){
		 	return res.send(handle(err,doc));
		});
	}
}