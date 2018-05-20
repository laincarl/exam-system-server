
import mongoose from "mongoose";
import Sequence from "./sequence";

const { Schema } = mongoose;
import  bcrypt  from "bcrypt";
const UserSchema = new Schema({
	id: { type: Number, index: { unique: true } },
	name: {
		type: String,
		required: true,
		unique: true
	},
	real_name:{
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		default:"images/default.png"
	},
	token: {
		type: String
	}
});
// 添加用户保存时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
UserSchema.pre("save", function (next) {
	var user = this;
	if (this.isModified("password") || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});
// 在创建文档时，获取自增ID值
UserSchema.pre("save", function (next) {
	var self = this;
	if (self.isNew) {
		Sequence.increment("User", function (err, result) {
			if (err)
				throw err;
			self.id = result.value.next;
			next();
		});
	} else {
		next();
	}
});
// 校验用户输入密码是否正确
UserSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, (err, isMatch) => {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

export default mongoose.model("User", UserSchema);