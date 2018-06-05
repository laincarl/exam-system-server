/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 17:45:01 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-05-20 17:45:01 
 * @Feature: 用户登录以及身份验证 
 */

import { Strategy } from "passport-http-bearer";
import passport from "passport";
import User from "./models/user";

export default function (role = ["student", "teacher", "admin"]) {
	console.log(role);
	let roles = role instanceof Array ? role : [role];
	if (roles.includes("student")) {
		roles = ["student", "teacher", "admin"];
	} else if (role.includes("teacher")) {
		roles = ["teacher", "admin"];
	}
	// 暂时
	roles = ["student", "teacher", "admin"];
	// use只会有一个，所以造成role只有最后一个生效
	passport.use(new Strategy(
		async (token, done) => {
			try {
				const user = await User.findOne({ token });
				console.log(role);
				if (user && roles.includes(user.role)) {
					return done(null, user);
				} else {
					return done(null, false);
				}
			} catch (err) {
				console.log("err");
				return done(err);
			}
		}
	));
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	
	passport.deserializeUser(function(user, done) {
		done(null, user);
	});
	// 定制验证后的回调函数
	return (req, res, next) => passport.authenticate("bearer", { session: false }, (err, user) => {
		// console.log(err, user);
		if (err) {
			return next(err);
		}
		if (!user) {
			// console.log(info.message);
			return res.send(401, "Unauthorized");
		}
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return;
		});
		return next();
	})(req, res, next);
}