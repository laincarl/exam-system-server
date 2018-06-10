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
		// if (!type) {
		// 	// console.log('缺少类型信息');
		// 	res.send({
		// 		status: 0,
		// 		type: "NEED_TYPE",
		// 		message: "缺少类型信息"
		// 	});
		// 	return;
		// }
		try {
			const banks = await BankModel.find(type ? { type } : {}, ["-_id", "-__v"]);
			
			if (!banks) {
				throw new Error("未找到题库");
			} else {
				res.send({
					status: 1,
					data: banks
				});
			}
		} catch (err) {
			console.log("未找到题库");
			res.send({
				status: 0,
				type: "BANK_NOT_FOUND",
				message: "未找到题库"
			});
		}

		// try{
		// 	throw new Error("用户名参数错误");
		// }catch(err){
		// 	next(err);
		// }
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
		if (!id || isNaN(page) || !pageSize) {
			// console.log('缺少类型信息');
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			const [bank, questions, count] = await Promise.all([
				await BankModel.findOne({ id }, ["-_id", "-__v"]),
				await QuestionModel.find({ bank_id: id }).skip(page * pageSize)
					.limit(5)
					.sort({ "_id": -1 }),
				await QuestionModel.count({ bank_id: id })
			]);
			const total_page = Math.ceil(count / pageSize);
			if (!bank) {
				throw new Error("未找到题库");
			} else if (!questions || isNaN(count)) {
				throw new Error("未找到试题");
			} else {
				res.send({
					status: 1,
					data: { bank: { ...bank._doc, ...{ count, total_page, current_page: page, } }, questions }
				});
			}
		} catch (err) {
			res.send({
				status: 0,
				type: "GET_ERROR",
				message: err.message
			});
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
		const { title, type } = req.body;
		if (!title || !type) {
			res.send({
				status: 0,
				type: "NEED_INFO",
				message: "缺少信息"
			});
			return;
		}
		try {
			const newBank = new BankModel({
				type,
				title,
			});
			await newBank.save();
			res.send({
				status: 1,
				data: "创建成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "SAVE_ERROR",
				message: "创建失败"
			});
		}
	}
}

export default new Bank();