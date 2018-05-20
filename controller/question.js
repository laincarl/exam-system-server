/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:55:48 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 19:59:39
 * @Feature: 考题controller 
 */
import QuestionModel from "../models/question";
/**
 * 考题类
 * 
 * @class Question
 */
class Question {
	constructor() {
		this.importQuestion = this.importQuestion.bind(this);
	}
	/**
  * 导入试题
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Question
  */
	async importQuestion(req, res) {
		if (!req.body) {
			console.log(req.body);
			res.json({ success: false, message: "请输入您的账号密码." });
		} else {
			const questions = req.body;
			// console.log(questions);
			let id = 1;
			QuestionModel.findOne().sort("-id").exec(function (err, item) {
				// console.log(item.id);
				if (item && item.id) {
					id = item.id + 1;
				}
				QuestionModel.insertMany(questions.map((one, i) => {
					const temp = {
						...one,
						...{
							id: id + i,
							bank_id: one.bankId
						}
					};
					delete temp.bankId;
					return temp;
				}), function (err) {
					if (err) {
						console.log(err);
						throw err;
					}
					res.json({ success: true, message: "导入成功!" });
				});
				// item.itemId is the max value
			});
		}
	}
}
export default new Question();