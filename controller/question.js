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
		const questions = req.body;
		if (!questions) {
			res.send({
				status: 0,
				type: "NEED_INFO",
				message: "缺少信息"
			});
			return;
		}
		
		try {
			let id = 1;
			// 找到id最大的项https://stackoverflow.com/questions/15033981/mongoose-get-max-id-from-table-before-inserting-new-row
			const maxIdItem = await QuestionModel.findOne().sort("-id");
			if (maxIdItem && maxIdItem.id) {
				id = maxIdItem.id + 1;
			}
			// console.log(id);
			await QuestionModel.insertMany(questions.map((one, i) => {
				const temp = {
					...one,
					...{
						id: id + i,				
					}
				};			
				return temp;
			}));
			// await QuestionModel.insertMany(questions);
			res.send({
				status: 1,
				data: "导入成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "INSERT_ERROR",
				message: err.message
			});
		}


		// function (err) {
		// 	if (err) {
		// 		console.log(err);
		// 		throw err;
		// 	}
		// 	res.json({ status: 1, message: "导入成功!" });
		// });
		// item.itemId is the max value

	}
}
export default new Question();