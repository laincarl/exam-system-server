const express = require("express");
const Bank = require("../models/bank");
const passport = require("passport");
const router = express.Router();

require("../passport")(passport);

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
router.get("/bank", (req, res) => {
	const id = req.query.id;
	Bank.findOne({ id }, ["-_id", "-__v"], (err, data) => {
		if (err) {
			console.log("err");
		} else {
			res.json(data);
			// console.log(data);
		}
	});
});
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