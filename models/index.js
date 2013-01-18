var mongoose = require('mongoose')
, bcrypt = require('bcrypt');
//mongoose.set('debug', function(a,b,c,d,e){console.log('---'); console.log(a); console.log(b); console.log(c); console.log(d);})
mongoose.connect('mongodb://localhost/telmaCookiesDB');
var db = mongoose.connection
, ObjectId = mongoose.Schema.ObjectId;

function extendStaticMethods(modelName, registerArr){
	var registerArr = (registerArr === undefined) ? [] : registerArr;
	var methods = {}
	var template = {
		list: function(search, cb){
			if (search != undefined)
				delete search._csrf;
			this.model(modelName).find(search,{},{sort:{dateCreated: 1}},function(err,doc){
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
			this.model(modelName).findOne(params, function(err,doc){
				if (err)
					return cb(err);
				doc.set(data);
				doc.save(function(e,d){
					if (e)
						return cb(e);
					return cb(null,doc);
				});
			});
		},
		upd: function(params, data, options, cb){
			this.model(modelName).update(params, data, options, function(err,doc){
				if (err)
					return cb(err)
				return cb(null,doc);
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
		modeState: {type: Boolean, default: true},
		title: String,
		facebook: {
			shareTitle: String,
			shareText: String,
			shareReference: Number
		}
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
	settingsSchema.statics.list = function(params, cb){
		this.model('Settings').findOne(params,{},{sort:{dateCreated: 1}}).lean().exec(function(err,doc){
			if (err)
				return cb(err);
			return cb(null,doc);
		});
	}
	
	/*
	 * Settings Model
	 */
	exports.Settings = db.model('Settings', settingsSchema);

	/*
	 * Settings Auto-populate
	 */
	exports.Settings.count({}, function(err,c){
		if(err)
			return err;
		if (c == 0) {
			exports.Settings.populate({title: 'Telma Cookies'}, function(err, doc){
				if(err)
					return err;
			});
		} else 
			return;
	})

	/*
	 * Power Users Schema
	 */
	var powerUsersSchema = new mongoose.Schema({
		username: {type: String, required: true, index: {unique:true} },
		password: {type: String, required: true},
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

	/*
	 * Power Users Manipulation
	 */
	powerUsersSchema.statics = extendStaticMethods('powerUsers', ['get','add']);
	powerUsersSchema.pre('save', function(next) {
		var user = this;
		if (!user.isModified('password')) return next();
		bcrypt.genSalt(10, function(err, salt) {
			if (err) return next(err);
			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) return next(err);
				user.password = hash;
				next();
			});
		});
	});
	powerUsersSchema.methods.comparePassword = function(candidatePassword, cb) {
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			if (err) return cb(err);
			cb(null, isMatch);
		});
	};

	/*
	 * Power Users Model
	 */
	exports.powerUsers = db.model('powerUsers', powerUsersSchema);

	/*
	 * Power Users Auto-Populate master user
	 */
	exports.powerUsers.count({}, function(err,c){
		if(err)
			return err;
		if (c == 0) {
			var defaultPowerUser = {
				username: 'Admin',
				password: 'Admin',
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
	});

	/*
	 * Statistics Schema
	 */
	var referenceSchema = new mongoose.Schema({
		ref: {type: Number, default: 0, index: true},
		count: Number
	});

	var sharesSchema = new mongoose.Schema({
		ref: {type: String, index: true},
		count: Number
	});

	referenceSchema.statics = extendStaticMethods('References', ['list', 'upd']);
	sharesSchema.statics = extendStaticMethods('Shares', ['list', 'upd']);

	exports.Refs = db.model('References', referenceSchema);
	exports.Shares  = db.model('Shares', sharesSchema);

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
		facebook: {
			shareImage: String,
			shareTitle: String,
			shareText: String,
			shareReference: Number
		},
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
	 * Voters Schema
	 */
	var votersSchema = new mongoose.Schema({
		slogan: String,
		name: String,
		email: String,
		phone: String,
		voted_user: {type: ObjectId, index: true},
		ref: {type: String, default: '0'},
		dateCreated: {type: Date, default: Date.now}
	});

	/*
	 * Voters Maniuplation
	 */
	votersSchema.statics = extendStaticMethods('Voters', ['list','add','get','edit']);

	/*
	 * Voters Model
	 */
	exports.Voters = db.model('Voters', votersSchema);
});