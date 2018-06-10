/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:42:05 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 19:49:18
 * @Feature:  试卷controller  
 */
import PaperModel from "../models/paper";
import QuestionModel from "../models/question";
/**
 * 试卷类
 * 
 * @class Paper
 */
class Paper {
	constructor() {
		this.getAllPaper = this.getAllPaper.bind(this);
		this.getPaper = this.getPaper.bind(this);
		this.newPaper = this.newPaper.bind(this);
	}
	/**
  * 获取所有试卷
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Paper
  */
	async getAllPaper(req, res) {
		try {
			const papers = await PaperModel.find({}, ["-_id", "-__v", "-parts"]);
			if (!papers) {
				throw new Error("未找到试卷");
			} else {
				res.send({
					status: 1,
					data: papers
				});
			}
		} catch (err) {
			console.log("未找到试卷");
			res.send({
				status: 0,
				type: "PAPER_NOT_FOUND",
				message: "未找到试卷"
			});
		}
	}
	/**
  * 获取单个试卷
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Paper
  */
	async getPaper(req, res) {
		const { id } = req.query;
		if (!id) {
			res.send({
				status: 0,
				type: "NEED_ID",
				message: "需要ID"
			});
			return;
		}
		try {
			const paper = await PaperModel.findOne({ id });
			if (!paper) {
				throw new Error("未找到试卷");
			}
			res.send({
				status: 1,
				data: paper
			});
		} catch (err) {
			console.log(err);
			res.send({
				status: 0,
				type: "PAPER_NOT_FOUND",
				message: err.message
			});
		}

	}
	/**
  * 新建一张试卷
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Paper
  */
	async newPaper(req, res) {

		const { title, parts } = req.body;
		if (!title || !parts) {
			res.send({
				status: 0,
				type: "NEED_Info",
				message: "缺少信息"
			});
		}
		let total_score = 0;
		try {
			await Promise.all(
				parts.map(async (part, i) => {
					const { bank_id, num, score } = part;
					// console.log(bank_id, num);
					total_score += num * score;
					const count = await QuestionModel.count({ bank_id });
					if (!count || count < num) {
						throw new Error(`第${i + 1}大题试题数量不足`);
					}
					const questions = await QuestionModel.aggregate([{
						$match: {
							bank_id
						}
					}, {
						$sample: {
							size: num
						}
					}]);
					part.questions = questions;
				})
			);
			var newPaper = new PaperModel({
				title,
				total_score,
				parts,
			});
			await newPaper.save();
			res.send({
				status: 1,
				data: "创建成功!"
			});

		} catch (err) {
			res.send({
				status: 0,
				type: "CREATE_ERR",
				message: err.message
			});
		}


	}
}
export default new Paper();