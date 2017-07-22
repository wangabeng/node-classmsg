var express = require("express");
var app = express();
var router=require('./router/router.js');
var session = require('express-session');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true// ,
  // cookie: { secure: true }
}))
// 
var db = require("./models/db.js");
var fs = require('fs');
// var gm = require('gm').subClass({imageMagick: true});
var gm = require('gm');


app.set("view engine","ejs");

app.use(express.static("./public"));

app.get('/',router.showIndex);
//注册页面
app.get('/regist',router.showRegist);
app.post('/doregist',router.doRegist);

//登录页面
app.get('/login',router.showLogin);
app.post('/doLogin',router.doLogin);

//设置头像 静态路由
app.use('/avatar',express.static('./avatar')); //使用的时候需要加/avator前缀

//设置头像路由
app.get('/setavatar',router.showAvatar);
//设置头像上传数据处理 post请求
app.post('/dosetavatar',router.dosetavatar);

//切图路由
app.get('/cut',router.showCut);
//执行切图
app.get('/docut',router.doCut);

//发表说说
app.post('/sendyy',router.doSendyy);

//获取所有说说
 app.get('/getallyy',router.getAllyy);

 //获取某个用户的信息
 app.get('/getuserinfo',router.getuserinfo);

 //列出所有说说的总数量
 app.get('/getallamount',router.getallamount);

app.listen(3000);


