module.exports=function(password){
	var crypto = require('crypto');
	var md5 = crypto.createHash('md5');
	var newPassword=md5.update(password).digest('base64');
	return newPassword;
}