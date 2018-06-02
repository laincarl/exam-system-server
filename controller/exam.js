/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:24:06 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-05-20 19:41:35
 * @Feature: exam的controller 
 */
import ExamModel from "../models/exam";
import PaperModel from "../models/paper";
import ResultModel from "../models/result";
import moment from "moment";
/**
 * 判断得分
 * @param {any} type 试题种类
 * @param {any} user_answer 用户答案数组
 * @param {any} answer 正确答案数组
 * @returns 
 */
function shouldGetScore(type, user_answer, answer) {
	if (type === "select_single") {
		return user_answer && user_answer[0] === answer[0];
	} else if (type === "select_multi") {
		return user_answer && user_answer.length === answer.length && user_answer.every(one => answer.includes(one));
	} else if (type === "blank") {
		return user_answer && user_answer.length === answer.length && user_answer.every((one, i) => answer[i] === one);
	}
}
/**
 * 
 * 
 * @class Exam
 */
class Exam {
	constructor() {
		this.getAllExam = this.getAllExam.bind(this);
		this.getExam = this.getExam.bind(this);
		this.deleteExam = this.deleteExam.bind(this);
		this.getResults = this.getResults.bind(this);
		this.getResultsAdmin = this.getResultsAdmin.bind(this);
		this.getResult = this.getResult.bind(this);
		this.submit = this.submit.bind(this);
		this.newExam = this.newExam.bind(this);
	}
	/**
  * 
  * 获取所有考试列表
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async getAllExam(req, res) {
		//取考试的同时把当前用户的考试结果取出，标记是否参加过
		const { _id } = req.user;
		ExamModel.find({ closed: false }).exec((err, exams) => {
			if (err) console.log(err);
			//深拷贝
			let examsModify = JSON.parse(JSON.stringify(exams));
			ResultModel.find({ user: _id }, (err, results) => {
				if (err) console.log(err);
				if (results) {
					results.forEach((result) => {
						examsModify.forEach(exam => {
							if (exam.id === result.exam_id) {
								exam.join = true;
								console.log(exam.id);
							}
						});
					});
					res.json(examsModify);
				} else {
					res.json(examsModify);
				}
			});
			// console.log(story.questions);
		});
	}
	/**
  * 
  * 获取单个考试
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async getExam(req, res) {
		ResultModel.findOne({ exam_id: req.query.id, user: req.user._id }, (err, data) => {
			if (err) {
				console.log(err);
			}
			if (data) {
				console.log(data);
				res.send(403, "已参加过该考试");
			} else {
				//不存在记录时再取考试
				ExamModel.findOne({ id: req.query.id, closed: false }, ["-_id"], (err, data) => {
					if (err) {
						console.log("err");
					} else {
						if (data) {
							// console.log(data);
							const { paper_id, range } = data;
							if (moment(range.start_time).isBefore(new Date())
								&& moment(range.end_time).isAfter(new Date())) {
								PaperModel.findOne({ id: paper_id }, ["-parts.questions.answers"]).populate({
									path: "parts.questions",
									select: "id title selects"
								}).exec((err, paper) => {
									if (err) console.log(err);
									if (paper) {
										res.json({ ...data._doc, ...paper._doc, ...{ id: data._doc.id } });
									} else {
										res.send(403, "试卷不存在");
									}
									// console.log(story.questions);
								});
							} else {
								res.send(403, "考试不在开启范围");
							}
						} else {
							res.send(403, "考试不存在");
						}
					}
				});
			}
		});

	}
	/**
  * 关闭一个考试
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async deleteExam(req, res) {
		// console.log(req.query.id);
		ExamModel.update({ id: req.query.id }, { $set: { closed: true } }, (err) => {
			if (!err) {
				res.send("关闭成功");
			} else {
				console.log(err);
			}
		});
	}
	/**
  * 管理员获取所有用户考试结果
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async getResultsAdmin(req, res) {
		// console.log(res.query)
		const page = parseInt(req.query.page);
		const pageSize = 5;
		ResultModel.count({}, (err, count) => {
			// console.log(page, count);
			ResultModel.find({}, ["-_id", "-__v"])
				.skip(page * pageSize)
				.limit(5)
				.sort({ "_id": -1 })
				.populate({
					path: "user",
					select: "name -_id"
				})
				.exec((err, data) => {
					if (err) console.log(err);
					if (data) {
						const total_page = Math.ceil(count / pageSize);
						res.json({ count, total_page, current_page: page, results: data });
					} else {
						res.status(404);
						res.json({ message: "考试结果不存在" });
					}
				});
		});
	}
	/**
  * 用户获取自己考试结果
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async getResults(req, res) {
		// console.log(res.query)
		const { _id } = req.user;
		ResultModel.find({ user: _id }, ["-_id", "-__v"]).populate({
			path: "user",
			select: "name -_id"
		}).exec((err, data) => {
			if (err) console.log(err);
			if (data) {
				res.json(data);
			} else {
				res.status(404);
				res.json({ message: "考试结果不存在" });
			}
		});
	}
	/**
  * 查询单个考试结果详情
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async getResult(req, res) {
		// console.log(res.query)
		const { _id } = req.user;
		ResultModel.findOne({ exam_id: req.query.id, user: _id }, ["-_id", "-__v"]).populate({
			path: "user",
			select: "name -_id"
		}).exec((err, data) => {
			if (err) console.log(err);
			if (data) {
				res.json(data);
			} else {
				res.status(404);
				res.json({ message: "考试结果不存在" });
			}
		});
	}
	/**
  * 交卷，进行打分
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async submit(req, res) {
		// console.log(req.body);
		//前端传回来题号组成的数组
		const { id, answers } = req.body;
		//answers结构
		// {
		// 	1:'A',
		// }
		const { _id } = req.user;
		//先取到考试，从考试中取到试卷
		ExamModel.findOne({ id }, ["-_id", "-questions._id"], (err, data) => {
			if (err) {
				console.log("err");
				res.json({ message: "考试不存在" });
			} else {
				const { paper_id, title, range, limit_time } = data;
				PaperModel.findOne({ id: paper_id })
					// .populate({
					// 	path: "parts.questions",
					// 	select: "id title selects answers"
					// })
					.exec((err, paper) => {
						if (err) console.log(err);
						if (paper) {
							//深拷贝，之后对值进行修改
							const result = JSON.parse(JSON.stringify(paper._doc));
							let total_score = 0;
							let user_score = 0;
							const { parts } = result;
							parts.forEach(part => {
								const { type, score, num, questions } = part;
								total_score += score * num;
								questions.forEach(question => {
									question["user_answer"] = answers[question.id];
									if (shouldGetScore(type, answers[question.id], question.answers)) {
										user_score += score;
									}
									// console.log(question);
								});
							});

							const newResult = new ResultModel({
								range,
								limit_time,
								exam_id: id,
								exam_title: title,
								paper_id,
								user: _id,
								total_score,
								user_score,
								parts
							});
							newResult.save((err) => {
								if (err) {
									console.log(err);
									throw err;
								}
								res.json({
									exam_id: id,
									exam_title: title,
									paper_id,
									user: _id,
									total_score,
									parts
								});
							});
						} else {
							res.status(404);
							res.json({ message: "试卷不存在" });
						}
					});
			}
		});
	}
	/**
  * 创建一个新考试
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async newExam(req, res) {
		if (!req.body) {
			console.log(req.body);
			res.json({ success: false, message: "请输入您的账号密码." });
		} else {
			// const { title,range } = req.body;
			console.log(req.body);
			var newExam = new ExamModel(req.body);
			newExam.save((err) => {
				if (err) {
					console.log(err);
					throw err;
				}
				res.json({ success: true, message: "创建成功!" });
			});
			// const { title } = req.body;
			// var newExam = new ExamModel({
			//   title,
			// });
			// newExam.save((err) => {
			//   if (err) {
			//     console.log(err);
			//     throw err;
			//   }
			//   res.json({ success: true, message: '创建成功!' });
			// });
		}
	}
}
export default new Exam();