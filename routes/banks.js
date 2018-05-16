const express = require("express");
const Bank = require("../models/bank");
const Question = require("../models/question");
const passport = require("passport");
const checkPermission = require("../middlewares/checkPermission");
const router = express.Router();

require("../passport")(passport);

async function getBank(req, res) {
	const id = req.query.id;
	const page = parseInt(req.query.page);
	const pageSize = 5;
	try {
		const data = await Bank.findOne({ id }, ["-_id", "-__v"]);
		const questions = await Question.find({ bank_id: id }).skip(page * pageSize)
			.limit(5)
			.sort({ "_id": -1 });
		const count = await Question.count({ bank_id: id });
		const total_page = Math.ceil(count / pageSize);
		res.json({ bank: { ...data._doc, ...{ count, total_page, current_page: page, } }, questions });
	} catch (err) {
		res.send(404, "不存在");
		console.log(err);
	}
}
//取所有试题
router.get("/", (req, res) => {
	const type = req.query.type;
	Bank.find(type ? { type } : {}, ["-_id", "-__v"], (err, data) => {
		if (err) {
			console.log("err");
		} else {
			res.json(data);
			// console.log(data);
		}
	});
});
//根据id取单个题库
router.get("/bank", passport.authenticate("bearer", { session: false }), checkPermission(["admin", "teacher"]), getBank);
// 添加新题库
router.post("/new", passport.authenticate("bearer", { session: false }), (req, res) => {
	if (!req.body) {
		console.log(req.body);
		res.json({ success: false, message: "请输入您的账号密码." });
	} else {
		const { title, type } = req.body;
		var newBank = new Bank({
			type,
			title,
		});
		newBank.save((err) => {
			if (err) {
				console.log(err);
				throw err;
			}
			res.json({ success: true, message: "创建成功!" });
		});
	}
});


module.exports = router;