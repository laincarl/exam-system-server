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
		PaperModel.find({}, ["-_id", "-__v", "-parts"], (err, data) => {
			if (err) {
				console.log("err");
			} else {
				res.json(data);
			}
		});
	}
	/**
  * 获取单个试卷
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Paper
  */
	async getPaper(req, res) {
		// console.log(res.query)
		PaperModel.findOne({ id: req.query.id }, ).exec((err, paper) => {
			if (err) console.log(err);
			if (paper) {
				res.json(paper);
			} else {
				res.status(404);
				res.json({ message: "试卷不存在" });
			}
			// console.log(story.questions);
		});
		// PaperModel.find({}, ['-_id', '-questions._id'], (err, data) => {
		//   if (err) {
		//     console.log("err");
		//   } else {
		//     res.json(data);
		//   }
		// })
	}
	/**
  * 新建一张试卷
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Paper
  */
	async newPaper(req, res) {
		if (!req.body) {
			console.log(req.body);
			res.json({ success: false, message: "请输入您的账号密码." });
		} else {
			const { title, parts } = req.body;
			Promise.all(
				parts.map(part => {
					const { bank_id, num } = part;
					// console.log(bank_id, num);
					return new Promise((resolve) => {
						QuestionModel.aggregate([{
							$match: {
								bank_id
							}
						}, {
							$sample: {
								size: num
							}
						}]).exec(function (err, result) {
							part.questions = result;
							// console.log(part.questions);
							resolve();
							// console.log(result);  // 10 random users 
						});
					});
				})
			).then(() => {
				var newPaper = new PaperModel({
					title,
					parts,
				});
				newPaper.save((err) => {
					if (err) {
						console.log(err);
						throw err;
					}
					res.json({ success: true, message: "创建成功!" });
				});
			});

		}
	}
}
export default new Paper();