/**
 * Copyright 2015-2016 ILP- Volunteer Management System.
 * Description: This is a service for ILP- Volunteer Management System
 * Author: Dileep
 * Version 1.0
 */

//Required node modules
var express = require('express');
var app = express();

var http = require('http');
var https = require('https');

var fs = require('fs');


var mysql = require('mysql');
var bodyParser = require('body-parser');

// Settings
var settings = require('./config/settings');

// logger
var logger = require('logger');

// include controllers
var customer = require("./lib/controllers/customer.js");

var commons = require("./lib/controllers/commons.js");

//global variables
var connection = null;

var customerMethods=["/register","/deleteCustomer","/editCustomer","/getCustomerList","/login"]

var allowedMethods=customerMethods;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended:true
}));

app.use(function (req,res,next){
	//res.header("Access-Control-Allow-Origin", "*");
	//res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
	res.header("Access-Control-Max-Age", 365*24*60*60); // seconds
	if(req.method!="POST" ||  allowedMethods.indexOf(req.url)==-1) {
		res.writeHead(200, {"Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"*"});	
		var respJson = {};
		respJson.statusCode = 404;
		respJson.message = "Invalid Request";
		logger.log("info","Response:(Not a valid path/method)"+ JSON.stringify(respJson));
		res.end(JSON.stringify(respJson));
	} else {
		if(req.body.userType=='admin' && req.url!='/logout' && req.url!='/login' && req.url!='/getFeedBackList' && req.url!='/forgotPassword') {
            commons.checkSessionExistance(connection,req.body.email,req.body.userType,function(cb)  {
                if(cb) {
                    next();
                } else {
                    res.writeHead(200, {"Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"*"});
                    var respJson = {};
                    respJson.status = 'loginFailed';
                    respJson.message = "You are not authorized to access this";
                    res.end(JSON.stringify(respJson));
                }
            });
	    } else {
            next();
	    }
	}
});

var done=false;

//Database Connection
var openDBConnection = function(){
	connection = mysql.createConnection({
		host: settings.mysql.host,
		user : settings.mysql.user,
		password:settings.mysql.password,
		database: settings.mysql.database
	});
	try{
		connection.connect(function(err){
			if(err) {
				logger.log("emergency","[dbConnection()]-Error encountered while connecting");
			}else{
				logger.log("debug","[dbConnection()]-Database Connected");
			}
		});
	}catch(e){
		logger.log("debug","[dbConnection()]-Caught Exception"+e);
	}
};
	

/* This function is used to register a Customers*/

app.post('/login', function(req,res){
	logger.log("debug","[register()]-Calling addCustomer========");
	res.writeHead(200, {"Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"*"});
	customer.setConnection(connection);
	customer.login(req,function(respJson) {
		res.end(JSON.stringify(respJson));
	});
});

app.post('/register', function(req,res){
	logger.log("debug","[register()]-Calling addCustomer");
	res.writeHead(200, {"Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"*"});
	
	customer.setConnection(connection);
	customer.register(req,function(respJson) {
		res.end(JSON.stringify(respJson));
	});
});


// HTTP server
var run_http_server = function(){
	http.createServer(app).listen(settings.service.http_port, settings.service.url);
	logger.log("debug","[run_http_server()]-running server on http://"+settings.service.url+':'+settings.service.http_port);
};

openDBConnection();

// Creating https server
if(settings.is_https != undefined && settings.is_https){
	if(settings.key_path!=undefined && settings.key_path!='' && settings.cert_path!=undefined && settings.cert_path!='' && settings.ca_path!= '' && settings.ca_path!=undefined){
		options.key = fs.readFileSync(settings.key_path);
		options.cert = fs.readFileSync(settings.cert_path);
		options.ca = fs.readFileSync(settings.ca_path);
		https.createServer(options).listen(settings.service.https_port, setting.service.url);
		run_http_server();
		console.log("settings.service.url", settings.service.url)
		logger.log("debug","[HTTPSERVICE--->]service is running on https://"+settings.service.url+':'+settings.service.https_port)
	}else{
		run_http_server();	
	}
}else{
	run_http_server();
}
