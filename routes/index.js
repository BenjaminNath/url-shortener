//variables
var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var config = require('../config');
var shortid = require('shortid');
var validUrl = require('valid-url');
var URL = 'mongodb://' + config.db.host + '/' + config.db.name;
var MongoClient = mongodb.MongoClient;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/new/:url(*)', function (req, res, next){
	MongoClient.connect(URL, function(err, db){
    if(err){
      console.log("Unable to connect to server", err);
		} else {
			console.log("Connected to server")
			var collection = db.collection('links');
			var params = req.params.url;

			var newLink = function(db, callback) {
				collection.findOne({"url": params }, {short: 1, _id: 0}, function(err,doc){
					if(doc != null){
				  	res.json({original_URL: params, short_URL: "localhost:3000/" +doc.short});
					} else {
						if(validUrl.isUri(params)){
							//if URL is valid, do this
							var shortCode = shortid.generate();
							var newURL = {url: params, short: shortCode};
							collection.insert([newURL]);
							res.json({orginal_URL: params, short_URL: "localhost:3000/" + shortCode});
						} else {
							//if URL is invalid, do this
							res.json({error:"Wrong url format, make sure you have a valid protocol and real site."});
						};
					};
				});
			};

			newLink(db, function(){
				db.close();
			});
		};
	});
});

router.get('/:short', function(req, res, next){
	MongoClient.connect(URL, function(err, db){
		if(err){
			console.log("Unable to connect to server", err);
		} else {
			console.log("Connected to server")
			var collection = db.collection('links');
			var params = req.params.short;

			var findLink = function(db, callback) {
		    collection.findOne({"short": params }, {url: 1, _id: 0}, function(err, doc) {
				  if(doc != null){
						res.redirect(doc.url);
					} else {
					  res.json({error: "No corresponding shortlink found in the database." });
					};
				});
			};
			findLink(db, function() {
				db.close();
			});
		};
	});
});

module.exports = router;
