/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 20:10:23 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 20:10:45
 * @Feature: 用户路由
 */

import express from "express";
import User from "../controller/user";
import passport from "../passport";
const router = express.Router();

const { getUserById, adduser, deluser, edituser, accesstoken, resetPassword, signup, head, info, alluser,fake } = User;
/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - Puppies
 *     description: 返回用户列表
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of puppies
 *         schema:
 *           $ref: '#/definitions/Puppy'
 */
router.get("/", passport("admin"), getUserById);
// 管理员添加账户
router.post("/adduser", passport("admin"), adduser);
router.delete("/deluser", passport("admin"), deluser);
router.put("/edituser", passport("admin"), edituser);
// 注册账户
router.post("/signup", signup);
// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post("/accesstoken", accesstoken);
router.post("/reset_password", passport(), resetPassword);
// 上传头像
router.post("/head", passport(), head);
// passport-http-bearer token 中间件验证
// 通过 header 发送 Authorization -> Bearer  + token
// 或者通过 ?access_token = token
router.get("/info", passport(), info);
router.get("/alluser", passport("admin"), alluser);
router.put("/fake", fake);



// router.get("/download", function (req, res) {
// 	console.log("---------访问下载路径-------------");
// 	var pathname = "/small.docx";
// 	var realPath = "assets" + pathname;
// 	fs.exists(realPath, function (exists) {
// 		if (!exists) {
// 			console.log("文件不存在");
// 			res.writeHead(404, {
// 				"Content-Type": "text/plain"
// 			});

// 			res.write("This request URL " + pathname + " was not found on this server.");
// 			res.end();
// 		} else {
// 			console.log("文件存在");
// 			fs.readFile(realPath, "binary", function (err, file) {
// 				if (err) {
// 					res.writeHead(500, {
// 						"Content-Type": "text/plain"
// 					});
// 					console.log("读取文件错误");
// 					res.end(err);
// 				} else {
// 					res.writeHead(200, {
// 						"Content-Type": "text/html"
// 					});
// 					console.log("读取文件完毕，正在发送......");

// 					res.write(file, "binary");

// 					res.end();
// 					console.log("文件发送完毕");
// 				}
// 			});
// 		}
// 	});
// });


export default router;