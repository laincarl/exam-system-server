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
		if (!id) {
			res.send({
				status: 0,
				type: "NEED_ID",
				message: "缺少用户ID"
			});
			return;
		}
		try {
			const user = await UserModel.findOne({ id }, ["id", "name", "real_name", "role", "-_id"]);
			if (!user) {
				throw new Error("没有找到用户");
			}
			res.send({
				status: 1,
				data: user
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "GET_ERROR",
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
		try {
			const users = UserModel.find({}, ["id", "name", "real_name", "role", "-_id"]);
			res.send({
				status: 1,
				data: users
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "GET_ERROR",
				message: err.message
			});
		}
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
		res.send({
			status: 1,
			data: {
				name,
				real_name,
				role,
				url: `${config.server}${url}`
			}
		});
	}
	/**
  * 
  * 注册接口
  * @param {any} req 
  * @param {any} res 
  * @memberof User
  */
	async signup(req, res) {
		const { name, password, real_name } = req.body;
		if (!name || !password || !real_name) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			var newUser = new UserModel({
				role: "student",
				name,
				real_name,
				password,
			});
			// 保存用户账号
			await newUser.save();
			res.send({
				status: 1,
				data: "成功创建新用户!"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "SIGN_UP_ERROR",
				message: "注册失败"
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
		const { id } = req.query;
		if (!id) {
			res.send({
				status: 0,
				type: "NEED_ID",
				message: "缺少用户ID"
			});
			return;
		}
		try {
			await UserModel.remove({ id: Number(id) });
			res.send({
				status: 1,
				data: "删除成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "DELETE_ERROR",
				message: err.message
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
		const { name, password, role, real_name } = req.body;
		if (!name || !password || !role || !real_name) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			var newUser = new UserModel({
				role,
				real_name,
				name,
				password
			});
			// 保存用户账号
			await newUser.save();
			res.send({
				status: 1,
				data: "创建成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "CREATE_ERROR",
				message: err.message
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
		const { id, name, initPassword, role, real_name } = req.body;
		if (!id || !name || !role || !real_name) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			//初始化密码为学工号
			const needUpdate = initPassword ?
				{ name, real_name, role, password: bcrypt.hashSync(name, 10) } :
				{ name, real_name, role };
			await UserModel.update({ id }, { $set: needUpdate });
			res.send({
				status: 1,
				data: "修改成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "EDIT_ERROR",
				message: err.message
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
		console.log(req.body);
		const { name, password } = req.body;
		if (!name || !password) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			const user = await UserModel.findOne({ name });
			if (!user) {
				throw new Error("用户不存在");
			}
			const isMatch = await user.comparePassword(password);
			if (!isMatch) {
				throw new Error("认证失败,密码错误!");
			}
			var token = jwt.sign({ name: user.name }, config.secret, {
				expiresIn: 10080  // token到期时间设置
			});
			user.token = token;
			await user.save();
			res.cookie("token", token);//登录成功之后为客户端设置cookie
			res.send({
				status: 1,
				data: {
					message: "验证成功!",
					token: "Bearer " + token,
					role: user.role,
					name: user.name
				}
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "LOGIN_ERROR",
				message: err.message
			});
		}
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