/*
 * @Author: LainCarl 
 * @Date: 2018-03-26 17:06:46 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-03-26 17:06:46 
 * @Feature: 一个题库 
 */

import mongoose from "mongoose";
import Sequence from "./sequence";

const { Schema } = mongoose;

const BankSchema = new Schema({
	id: { type: Number, index: { unique: true } },
	type: { type: String, required: true },
	title: { type: String, required: true },
});
// 在创建文档时，获取自增ID值
BankSchema.pre("save", function (next) {
	var self = this;
	if (self.isNew) {
		Sequence.increment("Bank", function (err, result) {
			if (err)
				throw err;
			self.id = result.value.next;
			next();
		});
	} else {
		next();
	}
});
export default mongoose.model("Bank", BankSchema);