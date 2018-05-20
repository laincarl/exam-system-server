import  express  from "express";
import  Paper  from "../models/paper";
import  Question  from "../models/question";
import  Result  from "../models/result";
// import  jwt  from "jsonwebtoken";
// import  config  from "../config";
import  passport  from "../passport";
const router = express.Router();

// require("../passport")(passport);

// function getRandomFromArr(arr, num) {
// 	let len = arr.length;
// 	if (len <= num) {
// 		return arr;
// 	} else {
// 		let result = [];
// 		for (let i = 0; i < num; i++) {
// 			let index = ~~(Math.random() * len) + i;
// 			result[i] = arr[index];
// 			arr[index] = arr[i];
// 			len--;
// 		}
// 		return result;
// 	}
// }
// function getRandomArbitrary(min, max) {
// 	return Math.ceil(Math.random() * (max - min) + min);
// }
//取所有试卷
router.get("/", passport(), (req, res) => {
	// Paper.find({}, ["-_id", "-__v", "-parts._id"]).populate({
	// 	path: "parts.questions",
	// 	select: "id title selects"
	// }).exec((err, story) => {
	// 	if (err) console.log(err);
	// 	res.json(story);
	// 	// console.log(story.questions);
	// });
	Paper.find({}, ["-_id", "-__v", "-parts"], (err, data) => {
		if (err) {
			console.log("err");
		} else {
			res.json(data);
		}
	});
});
//取单个试卷
router.get("/paper", passport(), (req, res) => {
	// console.log(res.query)
	Paper.findOne({ id: req.query.id }, ).exec((err, paper) => {
		if (err) console.log(err);
		if (paper) {
			res.json(paper);
		} else {
			res.status(404);
			res.json({ message: "试卷不存在" });
		}
		// console.log(story.questions);
	});
	// Paper.find({}, ['-_id', '-questions._id'], (err, data) => {
	//   if (err) {
	//     console.log("err");
	//   } else {
	//     res.json(data);
	//   }
	// })
});
//取单个试卷结果
router.get("/result", passport(), (req, res) => {
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
			res.json({ message: "试卷结果不存在" });
		}
	});
});
router.post("/submit", passport(), (req, res) => {
	// console.log(req.body);
	//前端传回来题号组成的数组
	const { id, title, questions } = req.body;
	const { _id } = req.user;
	const ids = questions.map(one => one.id);
	Question.find({ id: { $in: ids } }, (err, data) => {
		if (err) {
			console.log(err);
			console.log("err");
		} else {
			let score = 0;
			let obj = {};
			questions.forEach(one => {
				obj[one.id] = one.answers[0];
			});
			const results = [];
			data.forEach(one => {
				const temp = { ...one._doc };
				delete one._id;
				temp.choices = [obj[one.id]];
				if (one.answers[0] === obj[one.id]) {
					// console.log('对', one.title, one.answers)
					score += 1;
				} else {
					// console.log('错', one.title, one.answers)
				}
				// console.log(temp);
				results.push(temp);
			});
			const newResult = new Result({
				exam_id: id,
				exam_title: title,
				user: _id,
				score,
				results
			});
			newResult.save((err) => {
				if (err) {
					console.log(err);
					throw err;
				}
				res.json({ score, results });
			});
		}
	});
});
// 建立新的试卷
router.post("/new", passport(), (req, res) => {
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
					Question.aggregate([{
						$match : {
							bank_id
						}
					},{
						$sample: {
							size: num
						}
					}]).exec(function (err, result) {
						part.questions = result;
						// console.log(part.questions);
						resolve();
						// console.log(result);  // 10 random users 
					});
		
				// Question.find({ bank_id }, ["_id", "id"], (err, data) => {
				// 	if (err) {
				// 		console.log("err");
				// 	} else {
				// 		// 从题库中取随机问题，然后存到试卷中，拷贝
				// 		const ran=getRandomFromArr(data, num);
				// 		Question.find({ _id: { $in: ran } }, (err, data) => {
				// 			console.log();
				// 			part.questions = data._doc;
				// 			// console.log(part.questions);
				// 			resolve();
				// 		});							
				// 	}
				// });
				});
			})
		).then(() => {
			var newPaper = new Paper({
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



		// const { title } = req.body;
		// var newExam = new Paper({
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


export default router;