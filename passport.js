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
	let roles = role instanceof Array ? role : [role];
	if (roles.includes("student")) {
		roles = ["student", "teacher", "admin"];
	} else if (role.includes("teacher")) {
		roles = ["teacher", "admin"];
	}
	passport.use(new Strategy(
		function (token, done) {
			User.findOne({
				token: token
			}, function (err, user) {
				if (err) {					
					return done(err);
				}
				if (user && roles.includes(user.role)) {
					return done(null, user);
				} else {
					return done(null, false);
				}
			});
		}
	));
	return passport.authenticate("bearer", { session: false });
}