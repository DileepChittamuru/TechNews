var logger = require('logger');
var commons = require('./commons');

var settings = require('./../../config/settings');
var connection = null;

var fs = require('fs');

exports.setConnection = function(con) {
    connection = con;
};

exports.register = function(req, callback) {
    logger.log("debug", "[register()]-Calling register()");
    var respJson = {};
    if (req.body.email && req.body.password && req.body.mobileNumber && req.body.name) {
        //var path = req.files.image.path;
        //var arr  = path.split('/');
        var data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            userType: 'user',
            status: "Active",
            //	image:"http://192.168.0.199:8080/uploads/"+arr[6],
            contactNo: req.body.mobileNumber,
            activationCode: commons.genearateRandomNumber(),
            created_date_time: commons.getCurrentDateTime()
        };
        connection.query('insert into customers set ?', data, function(err, rows) {
            if (err) {
                console.log("err", err);
                logger.log("debug", "[register()]-Error occured while inserting, try after some time");
                respJson.status = false;
                respJson.statusMessage = "Error while register your details";
                if (err.toString().indexOf("ER_DUP_ENTRY") > -1) {
                    respJson.statusMessage = "Email already exists,Please try with different email";
                }
                callback(respJson);
            } else {
                respJson.statusCode = 200;
                respJson.status = true;
                respJson.statusMessage = "Your account has been created";
                callback(respJson);
            }
        });
    } else {
        respJson.status = false;
        respJson.statusMessage = "Please send valid json";
        callback(respJson);
    }
};

exports.login = function(req, callback) {
    logger.log("debug", "[login()]-Calling login()");
    var respJson = {};
    respJson.statusCode = 200;
    if (req.body.email && req.body.password) {
        var query = "select id, name,address,contactNo from customers where email='" + req.body.email + "' and password='" + req.body.password + "'  and (status='Active' or status='InActive')";
        connection.query(query, function(err, rows) {
            if (err) {
                logger.log("debug", "[login()]-Error while loging-in");
                respJson.status = false;
                respJson.statusMessage = "Error while loging-in";
                callback(respJson);
            } else {
                if (rows.length > 0) {
                    respJson.statusCode = 200;
                    respJson.status = true;
                    respJson.statusMessage = "logged in successfully";
                    respJson.data = rows[0];
                    console.log("respJson", respJson)
                    callback(respJson);

                } else {
                    respJson.status = false;
                    respJson.statusMessage = "Invalid Email / Password";
                    callback(respJson);
                }
            }
        });
    } else {
        respJson.status = false;
        respJson.statusMessage = "Please send valid json";
        callback(respJson);
    }
};
