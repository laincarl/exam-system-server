import mongoose from "mongoose";
const { Schema } = mongoose;

const QuestionSchema = new Schema({
	id: { type: Number, index: { unique: true } },
	// id: { type: Schema.Types.ObjectId, index: { unique: true } },
	bank_id: { type: Number, required: true },
	type: { type: String, required: true },
	title: { type: String, required: true },
	answers: [{ type: String }],
	selects: { type: Schema.Types.Mixed, required: true },
});
//可以在取数据的时候增加这个字段
// QuestionSchema.virtual("id").get(function () {
// 	return this._id;
// });
// 在创建文档时，获取自增ID值
// QuestionSchema.pre('save', function (next) {
//   var self = this;
//   if (self.isNew) {
//     Sequence.increment('Question', function (err, result) {
//       if (err)
//         throw err;
//       self.id = result.value.next;
//       next();
//     });
//   } else {
//     next();
//   }
// })
export default mongoose.model("Question", QuestionSchema);