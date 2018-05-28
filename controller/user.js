/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 17:03:02 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 20:07:10
 * @Feature: User的controller
 */
import fs from "fs";
import UserModel from "../models/user";
import jwt from "jsonwebtoken";
import config from "../config";
import multer from "multer";
import bcrypt from "bcrypt";
//只能以Form形式上传name为mFile的文件
//var upload = multer({ dest: 'upload/'}).single('mFile');
const upload = multer({ dest: "temp/" }).any();
/**
 * 用户类
 * 
 * @class User
 */
class User {
	constructor() {
		this.getUserById = this.getUserById.bind(this);
		this.accesstoken = this.accesstoken.bind(this);
		this.adduser = this.adduser.bind(this);
		this.deluser = this.deluser.bind(this);
		this.edituser = this.edituser.bind(this);
		this.signup = this.signup.bind(this);
		this.head = this.head.bind(this);
		this.info = this.info.bind(this);
		this.alluser = this.alluser.bind(this);
	}
	/**
	 * 管理员通过id获取用户
	 * 
	 * @param {any} req 
	 * @param {any} res 
	 * @memberof User
	 */
	async getUserById(req, res) {
		const { id } = req.query;
		try {
			const user = await UserModel.findOne({ id }, ["id", "name", "real_name", "role", "-_id"]);
			if (!user) {
				throw new Error("没有找到用户");
			}
			res.json({
				status: 1,
				data: user
			});
		} catch (err) {
			res.json({
				status: 0,
				// type:'',
				message: err.message
			});
		}
	}
	/**
  * 
  * 获取所有用户
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async alluser(req, res) {
		UserModel.find({}, ["id", "name", "real_name", "role", "-_id"], (err, data) => {
			if (err) {
				console.log("err");
			} else {
				res.json(data);
				// console.log(data);
			}
		});
	}
	/**
  * 
  * 获取个人信息，包括用户名，真实姓名，身份，头像
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async info(req, res) {
		const { name, real_name, url, role } = req.user;
		res.json({ name, real_name, role, url: `${config.server}${url}` });
	}
	/**
  * 
  * 注册接口
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async signup(req, res) {
		if (!req.body.name || !req.body.password || !req.body.real_name) {
			console.log(req.body.name);
			res.json({ success: false, message: "请输入您的账号密码." });
		} else {
			var newUser = new UserModel({
				role: "student",
				name: req.body.name,
				real_name: req.body.real_name,
				password: req.body.password
			});
			// 保存用户账号
			newUser.save((err) => {
				if (err) {
					console.log(err);
					return res.json({ success: false, message: "注册失败!" });
				}
				res.json({ success: true, message: "成功创建新用户!" });
			});
		}
	}
	/**
  * 
  * 删除一个用户
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async deluser(req, res) {
		const id = req.query.id;
		if (!id) {
			res.json({ success: false, message: "id为空" });
		} else {
			UserModel.remove({ id: Number(id) }, (err) => {
				if (err) {
					console.log(err);
					return res.json({ success: false, message: "移除失败!" });
				}
				res.json({ success: true, message: "移除成功!" });
			});
		}
	}
	/**
  * 
  * 增加一个用户
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async adduser(req, res) {
		const { name, real_name, role, password } = req.body;
		if (!name || !real_name || !role || !password) {
			console.log(req.body.name);
			res.json({ success: false, message: "请输入账号密码." });
		} else {
			var newUser = new UserModel({
				role,
				real_name,
				name,
				password
			});
			// 保存用户账号
			newUser.save((err) => {
				if (err) {
					return res.json({ success: false, message: "注册失败!" });
				}
				res.json({ success: true, message: "成功创建新用户!" });
			});
		}
	}
	/**
  * 
  * 编辑用户
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async edituser(req, res) {
		const { id, name, real_name, role, initPassword } = req.body;
		if (!id || !name || !real_name || !role) {
			console.log(req.body.name);
			res.json({ success: false, message: "请输入账号密码." });
		} else {
			//初始化密码为学工号
			const needUpdate = initPassword ? { name, real_name, role, password: bcrypt.hashSync(name, 10) } : { name, real_name, role };
			UserModel.update({ id }, { $set: needUpdate }, (err) => {
				if (err) {
					console.log(err);
					return res.json({ success: false, message: "修改失败!" });
				}
				res.json({ success: true, message: "修改成功!" });
			});
		}
	}
	/**
  * 
  * 获取token，登录
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async accesstoken(req, res) {
		UserModel.findOne({
			name: req.body.name
		}, (err, user) => {
			if (err) {
				throw err;
			}
			if (!user) {
				res.status(401);
				res.json({ success: false, message: "认证失败,用户不存在!" });
			} else if (user) {
				// 检查密码是否正确
				user.comparePassword(req.body.password, (err, isMatch) => {
					if (isMatch && !err) {
						var token = jwt.sign({ name: user.name }, config.secret, {
							expiresIn: 10080  // token到期时间设置
						});
						user.token = token;
						user.save(function (err) {
							if (err) {
								res.send(err);
							}
						});
						res.cookie("token", token);//登录成功之后为客户端设置cookie
						res.json({
							success: true,
							message: "验证成功!",
							token: "Bearer " + token,
							role: user.role,
							name: user.name
						});
					} else {
						res.status(401);
						res.send({ success: false, message: "认证失败,密码错误!" });
					}
				});
			}
		});
	}
	/**
  * 
  * 上传头像
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async head(req, res) {
		console.log("---------上传-------------");
		/** When using the "single"
        data come in "req.file" regardless of the attribute "name". **/
		upload(req, res, function (err) {
			//添加错误处理
			if (err) {
				console.log(err);
				return;
			}
			req.file = req.files[0];
			var tmp_path = req.file.path;
			console.log(tmp_path, req.file, req.file.filename);
			/** The original name of the uploaded file
          stored in the variable "originalname". **/
			const target_name = `${req.file.filename}${req.file.originalname.match(/\.[^]*?$/)}`;
			var target_path = `uploads/${target_name}`;

			/** A better way to copy the uploaded file. **/
			console.log(target_path);
			try {
				if (!fs.existsSync("public/uploads/")) {
					fs.mkdirSync("public/uploads/");
				}
				fs.rename(tmp_path, `public/${target_path}`, function (err) {
					if (!err) {
						console.log("rename complete.");
						//更新用户名  
						var conditions = { name: req.user.name };
						var updates = { $set: { url: target_path } };//将用户名更新为“tiny”  
						UserModel.update(conditions, updates, function (error) {
							if (error) {
								console.error(error);
							} else {
								console.error("更新头像成功");
								//查询更新后的数据  
								UserModel.findOne({ name: req.user.name }, function (error, doc) {
									if (error) {
										console.error(error);
									} else {
										res.json({ url: `${config.server}${doc.url}` });
										console.error("更新后数据：", doc);
									}
								});
							}
						});

					}
				});
			} catch (error) {
				throw error;
			}
		});
	}
}

export default new User();