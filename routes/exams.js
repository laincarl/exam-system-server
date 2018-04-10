const express = require("express");
const Exam = require("../models/exam");
// const Question = require("../models/question");
const Paper = require("../models/paper");
const Result = require("../models/result");
// const jwt = require("jsonwebtoken");
// const config = require("../config");
const passport = require("passport");
const moment = require("moment");
const router = express.Router();

require("../passport")(passport);


//取所有考试
router.get("/", passport.authenticate("bearer", { session: false }), (req, res) => {
	//取考试的同时把当前用户的考试结果取出，标记是否参加过
	const { _id } = req.user;
	Exam.find({}).exec((err, exams) => {
		if (err) console.log(err);
		//深拷贝
		let examsModify = JSON.parse(JSON.stringify(exams));
		Result.find({ user: _id }, (err, results) => {
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
	// Exam.find({}, ['-_id', '-questions._id'], (err, data) => {
	//   if (err) {
	//     console.log("err");
	//   } else {
	//     res.json(data);
	//   }
	// })
});
//取单个考试
router.get("/exam", passport.authenticate("bearer", { session: false }), (req, res) => {
	Result.findOne({ exam_id: req.query.id, user: req.user._id }, (err, data) => {
		if (err) {
			console.log(err);
		}
		if (data) {
			console.log(data);
			res.send(403, "已参加过该考试");
		} else {
			//不存在记录时再取考试
			Exam.findOne({ id: req.query.id }, ["-_id", "-questions._id"], (err, data) => {
				if (err) {
					console.log("err");
				} else {
					const { paper_id, range } = data;
					if (moment(range.start_time).isBefore(new Date())
						&& moment(range.end_time).isAfter(new Date())) {
						Paper.findOne({ id: paper_id }).populate({
							path: "parts.questions",
							select: "id title selects"
						}).exec((err, paper) => {
							if (err) console.log(err);
							if (paper) {
								res.json({ ...data._doc, ...paper._doc, ...{ id: data._doc.id } });
							} else {
								res.status(404);
								res.json({ message: "试卷不存在" });
							}
							// console.log(story.questions);
						});
					} else {
						res.status(404);
						res.json({ message: "考试不在开启范围" });
					}
				}
			});
		}
	});

});
//取所有考试结果
router.get("/results", passport.authenticate("bearer", { session: false }), (req, res) => {
	// console.log(res.query)
	const { _id } = req.user;
	Result.find({ user: _id }, ["-_id", "-__v"]).populate({
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
});
//取单个考试结果
router.get("/result", passport.authenticate("bearer", { session: false }), (req, res) => {
	// console.log(res.query)
	const { _id } = req.user;
	Result.findOne({ exam_id: req.query.id, user: _id }, ["-_id", "-__v"]).populate({
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
});
//提交考试结果
router.post("/submit", passport.authenticate("bearer", { session: false }), (req, res) => {
	// console.log(req.body);
	//前端传回来题号组成的数组
	const { id, answers } = req.body;
	//answers结构
	// {
	// 	1:'A',
	// }
	const { _id } = req.user;
	//先取到考试，从考试中取到试卷
	Exam.findOne({ id }, ["-_id", "-questions._id"], (err, data) => {
		if (err) {
			console.log("err");
			res.json({ message: "考试不存在" });
		} else {
			const { paper_id, title, range, limit_time } = data;
			Paper.findOne({ id: paper_id }).populate({
				path: "parts.questions",
				select: "id title selects answers"
			}).exec((err, paper) => {
				if (err) console.log(err);
				if (paper) {
					//深拷贝，之后对值进行修改
					const result = JSON.parse(JSON.stringify(paper._doc));
					let total_score = 0;
					let user_score = 0;
					const { parts } = result;
					parts.forEach(part => {
						const { score, num, questions } = part;
						total_score += score * num;
						questions.forEach(question => {
							question["user_answer"] = answers[question.id];
							if (question.answers[0] === answers[question.id]) {
								user_score += score;
							}
							// console.log(question);
						});
					});

					const newResult = new Result({
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





	// const newResult = new Result({
	// 	exam_id: id,
	// 	exam_title: title,
	// 	user: _id,
	// 	score,
	// 	results
	// });
	// newResult.save((err) => {
	// 	if (err) {
	// 		console.log(err);
	// 		throw err;
	// 	}
	// 	res.json({ score, results });
	// });
	// Question.find({ id: { $in: ids } }, (err, data) => {
	// 	if (err) {
	// 		console.log(err);
	// 		console.log("err");
	// 	} else {
	// 		let score = 0;
	// 		const results = [];
	// 		data.forEach(one => {
	// 			const temp = { ...one._doc };
	// 			delete one._id;
	// 			temp.choices = [answers[one.id]];
	// 			if (one.answers[0] === answers[one.id]) {
	// 				// console.log('对', one.title, one.answers)
	// 				score += 1;
	// 			} else {
	// 				// console.log('错', one.title, one.answers)
	// 			}
	// 			// console.log(temp);
	// 			results.push(temp);
	// 		});
	// 		const newResult = new Result({
	// 			exam_id: id,
	// 			exam_title: title,
	// 			user: _id,
	// 			score,
	// 			results
	// 		});
	// 		newResult.save((err) => {
	// 			if (err) {
	// 				console.log(err);
	// 				throw err;
	// 			}
	// 			res.json({ score, results });
	// 		});
	// 	}
	// });
});
// 建立新的考试
router.post("/new", passport.authenticate("bearer", { session: false }), (req, res) => {
	if (!req.body) {
		console.log(req.body);
		res.json({ success: false, message: "请输入您的账号密码." });
	} else {
		// const { title,range } = req.body;
		console.log(req.body);
		var newExam = new Exam(req.body);
		newExam.save((err) => {
			if (err) {
				console.log(err);
				throw err;
			}
			res.json({ success: true, message: "创建成功!" });
		});
		// const { title } = req.body;
		// var newExam = new Exam({
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
});


module.exports = router;