
import mongoose from "mongoose";
import Sequence from "./sequence";

const { Schema } = mongoose;

function dateFormat(fmt, date) { //author: meizz   
	var o = {
		"M+": date.getMonth() + 1,                 //月份   
		"d+": date.getDate(),                    //日   
		"h+": date.getHours(),                   //小时   
		"m+": date.getMinutes(),                 //分   
		"s+": date.getSeconds(),                 //秒   
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度   
		"S": date.getMilliseconds()             //毫秒   
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
function format(date) {
	return dateFormat("yyyy-MM-dd hh:mm:ss", date);
}
const PaperSchema = new Schema({
	id: { type: Number, index: { unique: true } },
	title: {
		type: String,
		required: true
	},
	create_time: {
		type: Date,
		default: Date.now,
		get: format
	},
	total_score: {
		type: Number,
		required: true
	},
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
}, {
	toObject: { getters: true, setters: true },
	toJSON: { getters: true, setters: true }
});
//取数据getter生效，toJSON和toObject是必须的
// 在创建文档时，获取自增ID值
PaperSchema.pre("save", function (next) {
	var self = this;
	if (self.isNew) {
		Sequence.increment("Paper", function (err, result) {
			if (err)
				throw err;
			self.id = result.value.next;
			next();
		});
	} else {
		next();
	}
});
//可以在取数据的时候增加这个字段
PaperSchema.virtual("createAt").get(function () {
	return this.create_time;
});
export default mongoose.model("Paper", PaperSchema);