import { Strategy } from "passport-http-bearer";
import  passport  from "passport";
import User from "./models/user";
export default (function (passport) {
	return passport.use(new Strategy(
		function (token, done) {
			User.findOne({
				token: token
			}, function (err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false);
				}
				return done(null, user);
			});
		}
	));
})(passport);