const express = require("express");
const Question = require("../models/question");
// const jwt = require("jsonwebtoken");
// const config = require("../config");
const passport = require("passport");
const router = express.Router();

require("../passport")(passport);

// babel-register
//取所有试题
router.get("/", (req, res) => {
	Question.find({}, (err, data) => {
		if (err) {
			console.log("err");
		} else {
			res.json(data);
			// console.log(data);
		}
	});
});
// 批量插入新的试题
router.post("/new", passport.authenticate("bearer", { session: false }), (req, res) => {
	if (!req.body) {
		console.log(req.body);
		res.json({ success: false, message: "请输入您的账号密码." });
	} else {
		const questions = req.body;
		// console.log(questions);
		let id = 1;
		Question.findOne().sort("-id").exec(function (err, item) {
			// console.log(item.id);
			if (item && item.id) {
				id = item.id + 1;
			}
			Question.insertMany(questions.map((one, i) => {
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
		// console.log(Question.find().sort({bank_id:-1}).limit(1));
		// questions.forEach(one => {
		//   const { title, answers, selects } = one;
		//   var newQuestion = new Question({
		//     bank_id: one.bankId,
		//     title,
		//     answers,
		//     selects
		//   });
		//   newQuestion.save((err) => {
		//     if (err) {
		//       console.log(err);
		//       throw err;
		//     }
		//     console.log(newQuestion.id);
		//     res.json({ success: true, message: '导入成功!' });
		//   });
		// })


	}
});


module.exports = router;