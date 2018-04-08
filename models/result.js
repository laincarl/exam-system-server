/*
 * @Author: LainCarl 
 * @Date: 2018-03-21 20:09:35 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-03-21 20:09:35 
 * @Feature: 存放考试结果  
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;
var Sequence = require("./sequence");
const ResultSchema = new Schema({
	id: { type: Number, index: { unique: true } },
	user: { type: Schema.Types.ObjectId, ref: "User" },
	create_time: {
		type: Date,
		default: Date.now,
	},
	range: {
		start_time: Date,
		end_time: Date,
	},
	limit_time: {
		type: Number,
		required: true
	},
	exam_id: { type: Number, required: true },
	paper_id: { type: Number, required: true },
	exam_title: { type: String, required: true },
	user_score: { type: Number, required: true },
	total_score: { type: Number, required: true },
	parts: [{
		type: {
			type: String,
			required: true
		},
		num: {
			type: Number,
			required: true
		},
		score: {
			type: Number,
			required: true
		},
		bank_id: {
			type: Number,
			required: true,
		},
		questions: [
			{
				type: Schema.Types.Mixed,
			}
		]
	}],
});
//取数据getter生效，toJSON和toObject是必须的
// 在创建文档时，获取自增ID值
ResultSchema.pre("save", function (next) {
	var self = this;
	if (self.isNew) {
		Sequence.increment("Exam", function (err, result) {
			if (err)
				throw err;
			self.id = result.value.next;
			next();
		});
	} else {
		next();
	}
});

module.exports = mongoose.model("Result", ResultSchema);