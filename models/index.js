var mongoose = require('mongoose');
mongoose.set('debug', function(a,b,c,d,e){console.log('---'); console.log(a); console.log(b); console.log(c); console.log(d);})
mongoose.connect('mongodb://localhost/telmaCookiesDB');
var db = mongoose.connection
, ObjectId = mongoose.Schema.ObjectId;

function extendStaticMethods(modelName, registerArr){
	var registerArr = (registerArr === undefined) ? [] : registerArr;
	var methods = {}
	var template = {
		list: function(cb){
			this.model(modelName).find({},{},{sort:{dateCreated: 1}},function(err,doc){
				if (err)
					return cb(err);
				return cb(null,doc);
			});
		},
		get: function(params,cb){
			this.model(modelName).findOne(params, function(err,doc){
				if (err)
					return cb(err);
				return cb(null,doc);
			});
		},
		add: function(data,cb){
			var tmp = new this(data);
			tmp.save(function(err,doc){
				if(err)
					return cb(err);
				return cb(null,doc);
			});
		},
		edit: function(params,data,cb){
			console.log('editing' + modelName);
			console.log(data);
			this.model(modelName).findOne(params, function(err,doc){
				if (err)
					return cb(err);
				doc.set(data);
				doc.save(function(e,d){
					return cb(null,doc);
				});
			});
		},
		delete: function(params,cb){
			this.remove(params, function(err,doc){
				if (err)
					return cb(err);
				return cb(null,doc);
			});
		}
	}

	methods = {};
	for (var i = 0; i < registerArr.length; i++){
		if (template[registerArr[i]] != undefined) {
			methods[registerArr[i]] = template[registerArr[i]];
		}
	}
	return methods;
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

	/*
	 * Settings Schema
	 */
	var settingsSchema = new mongoose.Schema({
		modeState: {type: Boolean, default: true}
	});
	/*
	 * Settings Manipulation
	 */

	settingsSchema.statics = extendStaticMethods('Settings', ['list', 'edit']);
	settingsSchema.statics.populate = function(data,cb){
		this.model('Settings').find({}, function(err,doc){
			if (err)
				return cb(err)
			if (typeof(doc) == 'null' || typeof(doc) == 'undefined' || doc.length == 0) {
				var Settings = db.model('Settings', settingsSchema);
				var tmp = new Settings(data);
				tmp.save(function(err,doc){
					if (err)
						return cb(err)
					return cb(doc);
				});
			} else {
				return cb();
			}
		});
	}
	
	/*
	 * Settings Model
	 */
	exports.Settings = db.model('Settings', settingsSchema);

	exports.Settings.count({}, function(err,c){
		if(err)
			return err;
		if (c == 0) {
			exports.Settings.populate({}, function(err, doc){
				if(err)
					return err;
			});
		} else 
			return;
	})

	var powerUsersSchema = new mongoose.Schema({
		username: String,
		password: String,
		salt: String,
		email: String,
		lastLogin: {type: Date, default: Date.now},
		lastIp: String,
		level: Number,
		name: {
			first: String,
			last: String
		},
		dateCreated: {type: Date, default: Date.now}
	});

	powerUsersSchema.statics = extendStaticMethods('powerUsers', ['get','add']);
	exports.powerUsers = db.model('powerUsers', powerUsersSchema);

	exports.powerUsers.count({}, function(err,c){
		if(err)
			return err;
		if (c == 0) {
			var defaultPowerUser = {
				username: 'Admin',
				password: 'Admin',
				salt: '12345',
				email: 'info@mediamagic.co.il',
				level: 1,
				name: {
					first: 'Master',
					last: 'Admin'
				}
			}
			exports.powerUsers.add(defaultPowerUser, function(err, doc){
				if(err)
					return err;
			});
		} else 
			return;
	})

	/*
	 * User Votes Schema
	 */
	var votesSchema = new mongoose.Schema({
		voterIp: String,
		voterId: ObjectId,
		dateCreated: {type: Date, default: Date.now}
	});

	/*
	 * Users Schema
	 */
	var usersSchema = new mongoose.Schema({
		name: String,
		videoId: String,
		description: String,
		hidden: {type: Boolean, default: true},
		votes: [votesSchema]
	});

	/*
	 * Users manipulation
	 */
	usersSchema.statics = extendStaticMethods('Users', ['list','get','add','edit']);

	/*
	 * Unique manipulations
	 */
	usersSchema.statics.vote = function(params,data,cb){
		this.model('Users').findOne(params, function(err,doc){
			if (err)
				return cb(err);
			doc.votes.push(data);
			doc.save(function(e,d){
				return cb(null,doc);
			});
		});
	}

	/*
	 * Users Model
	 */
	exports.Users = db.model('Users', usersSchema);


	/*
	 * Voters Model
	 */

	var votersSchema = new mongoose.Schema({
		name: String,
		email: String,
		phone: String,
		registered: {type: String, default: false},
		voted_user: {type: ObjectId, index: 1},
		ref: String
	});

	votersSchema.statics = extendStaticMethods('Voters', ['list','add','get','edit']);

	exports.Voters = db.model('Voters', votersSchema);
});