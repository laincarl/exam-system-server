/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:50:15 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 19:55:19
 * @Feature: 题库controller 
 */
import BankModel from "../models/bank";
import QuestionModel from "../models/question";
/**
 * 题库类
 * 
 * @class Bank
 */
class Bank {
	constructor() {
		this.getAllBank = this.getAllBank.bind(this);
		this.getBank = this.getBank.bind(this);
		this.newBank = this.newBank.bind(this);
	}
	/**
  * 获取所有题库
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Bank
  */
	async getAllBank(req, res) {
		const type = req.query.type;
		BankModel.find(type ? { type } : {}, ["-_id", "-__v"], (err, data) => {
			if (err) {
				console.log("err");
			} else {
				res.json(data);
				// console.log(data);
			}
		});
	}
	/**
  * 通过id取题库
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Bank
  */
	async  getBank(req, res) {
		const id = req.query.id;
		const page = parseInt(req.query.page);
		const pageSize = 5;
		try {
			const data = await BankModel.findOne({ id }, ["-_id", "-__v"]);
			const questions = await QuestionModel.find({ bank_id: id }).skip(page * pageSize)
				.limit(5)
				.sort({ "_id": -1 });
			const count = await QuestionModel.count({ bank_id: id });
			const total_page = Math.ceil(count / pageSize);
			res.json({ bank: { ...data._doc, ...{ count, total_page, current_page: page, } }, questions });
		} catch (err) {
			res.send(404, "不存在");
			console.log(err);
		}
	}
	/**
  * 创建一个题库
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Bank
  */
	async newBank(req, res) {
		if (!req.body) {
			console.log(req.body);
			res.json({ success: false, message: "请输入您的账号密码." });
		} else {
			const { title, type } = req.body;
			var newBank = new BankModel({
				type,
				title,
			});
			newBank.save((err) => {
				if (err) {
					console.log(err);
					throw err;
				}
				res.json({ success: true, message: "创建成功!" });
			});
		}
	}
}

export default new Bank();