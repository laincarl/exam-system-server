const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");// 用户认证模块passport

const routes = require("./routes"); //路由配置
const config = require("./config"); //全局配置
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const CamelCaseToUnderScoreCase=require("./middlewares/CamelCaseToUnderScoreCase");
let port = process.env.PORT || 8000;

const app = express();
// 跨域设置
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("X-Powered-By", " 3.2.1")
  res.header("Content-Type", "application/json;charset=utf-8")
  next();
});
app.use(logger("dev"));// 命令行中显示程序运行日志,便于bug调试
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());// 初始化passport模块
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // 调用bodyParser模块以便程序正确解析body传入值
// app.use(CamelCaseToUnderScoreCase());
routes(app); // 路由引入

mongoose.Promise = global.Promise;
mongoose.connect(config.database); // 连接数据库

app.listen(port, () => {
	console.log("listening on port : " + port);
});