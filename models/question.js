const mongoose = require('mongoose');
const { Schema } = mongoose;
var Sequence = require('./sequence');

const QuestionSchema = new Schema({
  id: { type: Number, index: { unique: true } },
  bank_id: { type: Number, required: true },
  title: { type: String, required: true },
  answers: [{ type: String}],
  selects: { type: Schema.Types.Mixed, required: true },
})
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
module.exports = mongoose.model('Question', QuestionSchema);