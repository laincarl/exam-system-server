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
		const { user } = req;
		try {
			const [exams, results] = await Promise.all([
				await ExamModel.find({ closed: false }),
				await ResultModel.find({ user, handin: true })
			]);
			let examsModify = JSON.parse(JSON.stringify(exams));
			// 将参加过的考试标记
			results.forEach((result) => {
				examsModify.forEach(exam => {
					if (exam.id === result.exam_id) {
						exam.join = true;
						console.log(exam.id);
					}
				});
			});
			res.send({
				status: 1,
				data: examsModify
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
  * 获取单个考试
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async getExam(req, res) {
		const exam_id = req.query.id;
		const user = req.user._id;
		if (!exam_id || !user) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			// 取result，判断是否参加考试
			const result = await ResultModel.findOne({ exam_id, user });
			// 定义当前用户考试结束时间，等于取试卷时间+考试时间限制。
			let end_time = null;
			if (result && result.handin) {
				throw new Error("已参加过该考试");
			} else if (result) {
				end_time = result.end_time;
			}
			// 取考试信息
			const exam = await ExamModel.findOne({ id: exam_id, closed: false }, ["-_id"]);
			if (!exam) {
				throw new Error("未找到考试");
			}
			const { paper_id, range } = exam;
			// 判断考试是否在开启
			if (!moment(range.start_time).isBefore(moment()) || !moment(range.end_time).isAfter(moment())) {
				throw new Error("考试不在开启范围");
			}
			// 判断当前用户时间是否用完
			if (!moment(end_time).isAfter(moment())) {
				throw new Error("考试时间已用尽");
			}
			// 查询试卷,不取答案
			const paper = await PaperModel.findOne({ id: paper_id }, ["-parts.questions.answers"]);
			if (!paper) {
				throw new Error("未找到试卷");
			}
			// 如果不存在result，则存下end_time
			if (!result) {
				const { paper_id, title, range, limit_time } = exam;
				end_time = moment().add(limit_time, "minutes");
				const newResult = new ResultModel({
					end_time,
					range,
					limit_time,
					exam_id,
					exam_title: title,
					paper_id,
					user,
					total_score: 0,
					user_score: 0,
					parts: []
				});
				await newResult.save();
			}
			// 返回试卷信息
			res.send({
				status: 1,
				data: {
					...exam._doc,
					...paper._doc,
					...{
						id: exam._doc.id,
						end_time
					}
				}
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
  * 关闭一个考试
  * 
  * @param {any} req 
  * @param {any} res 
  * @memberof Exam
  */
	async deleteExam(req, res) {
		// console.log(req.query.id);
		const id = req.query.id;
		if (!id) {
			res.send({
				status: 0,
				type: "NEED_ID",
				message: "缺少考试ID"
			});
			return;
		}
		try {
			await ExamModel.update({ id: req.query.id }, { $set: { closed: true } });
		} catch (err) {
			res.send({
				status: 0,
				type: "DELETE_ERROR",
				message: err.message
			});
		}
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
		if (page == undefined) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
		}
		try {
			const count = await ResultModel.count({ handin: true });
			const results = await ResultModel.find({ handin: true }, ["-_id", "-__v"])
				.skip(page * pageSize)
				.limit(pageSize)
				.sort({ "_id": -1 })
				.populate({
					path: "user",
					select: "name -_id"
				})
				.exec();
			const total_page = Math.ceil(count / pageSize);
			res.send({
				status: 1,
				data: {
					count,
					total_page,
					current_page: page,
					results
				}
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
		* 用户获取自己考试结果
		* 
		* @param {any} req 
		* @param {any} res 
		* @memberof Exam
		*/
	async getResults(req, res) {
		const { user } = req;
		try {
			const result = await ResultModel.find({ user, handin: true }, ["-_id", "-__v"]);
			res.send({
				status: 1,
				data: result
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
		* 查询单个考试结果详情
		* 
		* @param {any} req 
		* @param {any} res 
		* @memberof Exam
		*/
	async getResult(req, res) {
		// console.log(res.query)
		const { user } = req;
		const exam_id = req.query.id;
		if (!exam_id) {
			res.send({
				status: 0,
				type: "NEED_ID",
				message: "缺少考试ID"
			});
			return;
		}
		try {
			const result = await ResultModel.findOne({ exam_id: req.query.id, user, handin: true }, ["-_id", "-__v"]);
			if (!result) {
				throw new Error("未参加该考试");
			}
			res.send({
				status: 1,
				data: result
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
		* 交卷，进行打分
		* 
		* @param {any} req 
		* @param {any} res 
		* @memberof Exam
		*/
	async submit(req, res) {
		// console.log(req.body);
		//前端传回来题号组成的数组
		// const { id, answers } = req.body;
		const answers = req.body.answers;
		const exam_id = req.body.id;
		const user = req.user._id;
		if (!exam_id || !answers || !user) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		//answers结构
		// {
		// 	1:'A',
		// }
		//先取到考试，从考试中取到试卷
		try {
			const exam = await ExamModel.findOne({ id: exam_id }, ["-_id", "-questions._id"]);
			if (!exam) {
				throw new Error("未找到考试");
			}
			const { paper_id, title } = exam;
			const paper = await PaperModel.findOne({ id: paper_id });
			if (!paper) {
				throw new Error("未找到试卷");
			}
			//深拷贝，之后对值进行修改
			const result = JSON.parse(JSON.stringify(paper._doc));
			if (!result) {
				throw new Error("结果出现错误");
			} else if (result.handin) {
				throw new Error("已参加过该考试");
			} else if (!moment(result.end_time).isBefore(moment())) {
				throw new Error("考试时间已用完");
			}
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
			// 将考试结果存入
			await ResultModel.update({ exam_id, user }, {
				$set:
					{
						handin: true,
						total_score,
						user_score,
						parts
					}
			});
			res.send({
				status: 1,
				data: {
					exam_id,
					exam_title: title,
					paper_id,
					user,
					total_score,
					parts
				}
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "SUBMIT_ERROR",
				message: err.message
			});
		}
	}
	/**
		* 创建一个新考试
		* 
		* @param {any} req 
		* @param {any} res 
		* @memberof Exam
		*/
	async newExam(req, res) {

		const { title, range, limit_time, paper_id } = req.body;
		if (!title || !range || !limit_time || !paper_id) {
			res.send({
				status: 0,
				type: "NEED_PARAMETERS",
				message: "缺少参数"
			});
			return;
		}
		try {
			var newExam = new ExamModel({
				title,
				range,
				limit_time,
				paper_id
			});
			await newExam.save();
			res.send({
				status: 1,
				data: "创建成功"
			});
		} catch (err) {
			res.send({
				status: 0,
				type: "CREATE_ERROR",
				message: "创建失败"
			});
		}
	}
}
export default new Exam();