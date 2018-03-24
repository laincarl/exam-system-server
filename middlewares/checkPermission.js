module.exports = function checkPermission(role) {
  const roles = role instanceof Array ? role : [role];
  if (roles.includes('student')) {
    roles = ['student', 'teacher', 'admin'];
  } else if (role.includes('teacher')) {
    roles = ['teacher', 'admin']
  }
  return function (req, res, next) {
    const { user } = req;
    // console.log(user, roles, roles.includes(user.role));
    if (roles.includes(user.role)) {
      next(); //执行下一个中间件
    } else {
      res.send(403);
    }
  }
}
