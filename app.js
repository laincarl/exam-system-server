const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");// 用户认证模块passport

const routes = require("./routes"); //路由配置
const config = require("./config"); //全局配置
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

let port = process.env.PORT || 8000;

const app = express();

app.use(logger("dev"));// 命令行中显示程序运行日志,便于bug调试
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());// 初始化passport模块
app.use(bodyParser.json()); // 调用bodyParser模块以便程序正确解析body传入值
app.use(bodyParser.urlencoded({ extended: false }));
routes(app); // 路由引入

mongoose.Promise = global.Promise;
mongoose.connect(config.database); // 连接数据库

app.listen(port, () => {
	console.log("listening on port : " + port);
});