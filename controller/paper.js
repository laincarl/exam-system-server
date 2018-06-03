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
		await Promise.all(
			parts.map(async (part) => {
				const { bank_id, num } = part;
				// console.log(bank_id, num);
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
			parts,
		});
		newPaper.save((err) => {
			if (err) {
				console.log(err);
				throw err;
			}
			res.json({ status: 1, message: "创建成功!" });
		});

	}
}
export default new Paper();