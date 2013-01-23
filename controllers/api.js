var csv = require('csv')
, db = require('../models');
/*
 * Gereric api utils
 */

exports.videoCheck = function (req,res,next) {
	var videoID = req.params.id;
	var http = require('http');
	var options = {
		host: "www.youtube.com",
		path: "/oembed?url=http%3A%2F%2Fyoutube.com%2Fwatch%3Fv%3D"+videoID+"&format=json"
	};
	var callback = function(response) {
		var str = '';
		response.on('data', function (chunk) {
		str += chunk;
	});
	response.on('end', function () {
	res.setHeader("Content-Type", "application/json");
			res.send(str);
		});
	}
	http.request(options, callback).end();
}

exports.createCSV = function(req,res,next){
	var params = {};
	if (req.params.id != undefined)
		params._id = req.params.id;
	db.Voters.list(params, function(err,resp){
		var tmp = [];
		tmp.push('"Slogan",','"Name",','"Email",','"Phone",','"Referer",', '"Date Created"\n');
		for (var i = 0; i<resp.length;i++){
			var row = [];
			var val = resp[i];
			row.push('"'+val.slogan+'"','"'+val.name+'"','"'+val.email+'"','="'+val.phone+'"','"'+val.ref+'"', '"'+val.dateCreated+'"\n')
			row = row.join(',');
			tmp.push(row);
			delete row;
		}
		resp = tmp.join('');
		delete tmp;
		csv()
		.from.array( resp )
		.to(function(data){
				res.set("Content-type", 'application/csv; charset=utf8');
				return res.end(data, 'UTF-8');
			});
	});
}