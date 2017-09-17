// logger
var logger = require('logger');
var crypto = require('crypto');

/**
 * Generating the md5 hash for password
 */
exports.get_hash = function(password) {
    return crypto.createHash('md5').update(password).digest("hex");
};

exports.genearateRandomNumber = function() {
    var num = Math.random();
    num = Math.floor(num * 10000);
    return num;
};
