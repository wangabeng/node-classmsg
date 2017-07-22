var express = require("express");
var app = express();
var router=require('./router/router.js');
var session = require('express-session');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

var db = require("./models/db.js");
var fs = require('fs');

var gm = require('gm');


app.set("view engine","ejs");

app.use(express.static("./public"));

app.get('/',router.showIndex);

app.get('/regist',router.showRegist);
app.post('/doregist',router.doRegist);


app.get('/login',router.showLogin);
app.post('/doLogin',router.doLogin);


app.use('/avatar',express.static('./avatar')); //使用的时候需要加/avator前缀


app.get('/setavatar',router.showAvatar);

app.post('/dosetavatar',router.dosetavatar);


app.get('/cut',router.showCut);

app.get('/docut',router.doCut);

app.post('/sendyy',router.doSendyy);


 app.get('/getallyy',router.getAllyy);

 
 app.get('/getuserinfo',router.getuserinfo);


 app.get('/getallamount',router.getallamount);

// app.listen(3000);
var serverPort = process.env.PORT || 5000;
app.listen(serverPort);
