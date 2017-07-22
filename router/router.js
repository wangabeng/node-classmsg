var formidable = require('formidable');
var db=require('../models/db.js');
var md5=require('../models/md5.js');
// var session = require('express-session');

var path=require('path');
var fs=require('fs');

//引入gm
var gm = require('gm');

//一个小坑 session设置在app里用 不要在router里设置
/*app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))*/

exports.showIndex=function(req,res){
	//查找数据库 如果登录的时候 就是req.session.login=1的时候 查找登录用户的头像 否则 直接渲染默认的头像
	if (req.session.login=='1') {
		db.find('users',{'username':req.session.username},function(err,result){
			var avatar=result[0].avatar||'default';
			db.find('posts',{},{"sort":{'datetime':-1}},function(err,result2){
				res.render('index',{
					'login':req.session.login=='1'?true:false,
					'username':req.session.login=='1'?req.session.username:'',
					'active':'index',
					'avatar':avatar,
					'yyarr':result2//yyarr 存放在posts这个collections里 需要检索数据库才能得到
				});				
			});

		});
	}else{
		res.render('index',{
			'login':req.session.login=='1'?true:false,
			'username':req.session.login=='1'?req.session.username:'',
			'active':'index',
			'avatar':'default'
		});	
	}

}

//注册表单路由
exports.showRegist=function(req,res){
	// console.log(req.session.login+'222');
	res.render('regist',{
		'login':req.session.login=='1'?true:false,
		'username':req.session.login=='1'?req.session.username:'',
		'active':'regist'
	});
}

//处理表单请求 不是路由
exports.doRegist=function(req,res){
	var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
      var username=fields.username;
      var password=md5(md5(fields.password)+2);
      // console.log(fields);
      //查询这个用户 是否可以注册
      db.find('users', {'username':username}, function(err,result){
      	if (err) {
      		res.send('-1');
      	}
      	if (result.length!=0) {
      		res.send('-3');
      	}else{
      		//插入数据
      		db.insertOne('users', {
      			'username':username,
      			'password':password,
      			'avatar':'default'
      		}, function(err,result){
      			// console.log('begin');
      			// console.log(result);
      			//设置session
      			req.session.login='1';//+1表示写入session
      			req.session.username=username;

      			//console.log(req.session.login);//设置成功
      			res.send('1');
      		});
      	}
      });
    });

}

//显示登录页面路由
exports.showLogin=function(req,res){
	res.render('login',{
		'login':req.session.login=='1'?true:false,
		'username':req.session.login=='1'?req.session.username:'',
		'active':'login'
	});
}

//处理登录数据
exports.doLogin=function(req,res){
	var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files){
      var username=fields.username;
      var password=md5(md5(fields.password)+2);
      // console.log(fields);
      //查询这个用户 是否存在
      db.find('users', {'username':username}, function(err,result){
	      	if (err) {
	      		//服务器错误 返回-3
	      		res.send('-3');
	      	}
	      	if (result.length!=0) { //找到了有这个用户
	      		//查看这个用户输入的密码和数据库里的密码比对 看是否一致
	      		var actualPassword=result[0].password;
	      		var md5actualPassword= md5(md5(actualPassword)+2);
	      		if (actualPassword==password) { //登录成功 返回 1
	      			//写入session
	      			console.log('1');
	      			req.session.login='1';//+1表示写入session
      				req.session.username=username;

	      			res.send('1');
	      			return; 
	      		}else{ //密码错误 返回-1
	      			console.log('-1');
	      			res.send('-1');
	      			return;
	      		}
	      		//console.log(result[0].password);
	      	}else{ //没有这个用户 返回-2
	      		console.log('no this one');
	      		res.send('-2');
	      		return;
	      	}
      });
    });

}

//设置头像路由
exports.showAvatar=function(req,res){
	if (req.session.login!='1'){
		res.send('Illegal enter');
		return;
	}else{
		res.render('setavatar',{
			'login':true,
			'username':req.session.username,
			'active':'modify'
			// 'avatar':avatar
		});		
	}

}

//设置头像上传图像处理
exports.dosetavatar=function(req,res){
	//先加判断防止用户未登录进入该页面
	if (req.session.login!='1'){
		res.send('Illegal enter');
		return;
	}

	var form = new formidable.IncomingForm();
	//form.uploadDir = "./avatar";//从cmd光标开始的
	form.uploadDir=path.normalize(__dirname+'/../avatar/');
	form.parse(req, function(err,fields,files) {
		if (err) {
			console.log(err);
			return;
		}
		//上传成功后改名 7月10日来做
		var oldPath=files.portrait.path;
		// var newPath=path.normalize(__dirname+'/../avatar')+'/'+req.session.username+'.jpg';
		var newPath=path.normalize(__dirname+'/../avatar')+'/'+req.session.username+'.jpg';
		fs.rename(oldPath, newPath, function(err){
			if (err) {
				res.send('failure');
				return;
			}
			// console.log('sucess');
			// 改名成功后 跳转到切图的页面
			// 改名成功后同时设置session
			req.session.avatar=req.session.username;
			res.redirect('/cut');
		});
		//console.log(files.portrait.path); 
		
    	
    });
}

//切图路由
exports.showCut=function(req,res){
	res.render('cut.ejs',{
		'avatar':req.session.avatar
	});
}

//执行切图
exports.doCut=function(req,res,next){
    //接收get请求 裁切图片
    var w=req.query.w;
    var h=req.query.h;
    var l=req.query.l;
    var t=req.query.t;
    // console.log(w);
    // console.log(h);
    // console.log(l);
    // console.log(t);
    var filename=req.session.avatar;

    gm('./avatar/'+filename+'.jpg')
    .crop(w, h, l, t)
    .resize(100,100,'!')
    .write('./avatar/'+filename+'.jpg', function (err) {
      if (err) {
        //console.log(err);
        res.send('-1');
        return;
      };
      //改名成功之后设置其avatar 默认值default.jpg属性为req.session.avatar
      db.updateMany('users', {'username':req.session.username},{$set:{
      	'avatar':req.session.avatar
      }},function(err,result){
      	if (err) {
      		res.send('-3');
      	}
      	res.send('1');
      });
      
    });

}

//发表说说
exports.doSendyy=function(req,res){
	//如果未登录 非法闯入
	if (req.session.login!='1'){
		res.send('Illegal enter');
		return;
	}
	var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
      
		var username=req.session.username;
		var content=fields.content;
		var datetime=new Date();
		//插入数据库
		db.insertOne('posts', {
			'username':username,
			'content':content,
			"datetime":datetime
		}, function(err,result){
			if (err) {
				res.send('-3');
				return;
			}
			console.log(content);
			res.send('1');
			return;
		});

    });

}

//获取所有成员的说说
// {'pageamount':'10','page':page},
exports.getAllyy=function(req,res){
	var page=req.query.page;
	db.find('posts',{},{'pageamount':20,'page':page},function(err,result){
		//console.log(result);
		res.json(result);//导出的是个数组 内部机制是导出一个对象{result:[]}
	});
}

//获取某个用户的信息
exports.getuserinfo=function(req,res){
	var username=req.query.username;
	db.find('users',{'username':username},function(err,result){
		console.log(result);
		res.json(result);//导出的是个数组 内部机制是导出一个对象{result:[]}
	});
}

//获取说说的总数量
exports.getallamount=function(req,res){
	var username=req.query.username;
	db.getAllCount('users',function(count){
		console.log(count);
		res.json(count);
	});
}