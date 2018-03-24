const express = require('express');
const fs = require('fs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
var multer = require('multer');
const checkPermission = require('../middlewares/checkPermission');
const router = express.Router();

require('../passport')(passport);
//只能以Form形式上传name为mFile的文件
//var upload = multer({ dest: 'upload/'}).single('mFile');
var upload = multer({ dest: 'temp/' }).any();
// 管理员添加账户
router.post('/adduser', passport.authenticate('bearer', { session: false }), checkPermission('admin'), (req, res) => {
  const { name, real_name, role, password } = req.body;
  if (!name || !real_name || !role || !password) {
    console.log(req.body.name);
    res.json({ success: false, message: '请输入账号密码.' });
  } else {
    var newUser = new User({
      role,
      real_name,
      name,
      password
    });
    // 保存用户账号
    newUser.save((err) => {
      if (err) {
        return res.json({ success: false, message: '注册失败!' });
      }
      res.json({ success: true, message: '成功创建新用户!' });
    });
  }
});
// 注册账户
router.post('/signup', (req, res) => {
  if (!req.body.name || !req.body.password || !req.body.real_name) {
    console.log(req.body.name);
    res.json({ success: false, message: '请输入您的账号密码.' });
  } else {
    var newUser = new User({
      role: 'student',
      name: req.body.name,
      real_name: req.body.real_name,
      password: req.body.password
    });
    // 保存用户账号
    newUser.save((err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: '注册失败!' });
      }
      res.json({ success: true, message: '成功创建新用户!' });
    });
  }
});

// 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/accesstoken', (req, res) => {
  User.findOne({
    name: req.body.name
  }, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.status(401);
      res.json({ success: false, message: '认证失败,用户不存在!' });
    } else if (user) {
      // 检查密码是否正确
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign({ name: user.name }, config.secret, {
            expiresIn: 10080  // token到期时间设置
          });
          user.token = token;
          user.save(function (err) {
            if (err) {
              res.send(err);
            }
          });
          res.cookie('token', token);//登录成功之后为客户端设置cookie
          res.json({
            success: true,
            message: '验证成功!',
            token: 'Bearer ' + token,
            role: user.role,
            name: user.name
          });
        } else {
          res.status(401);
          res.send({ success: false, message: '认证失败,密码错误!' });
        }
      });
    }
  });
});
// 上传头像
router.post('/head', passport.authenticate('bearer', { session: false }), (req, res) => {
  console.log("---------上传-------------");

  /** When using the "single"
      data come in "req.file" regardless of the attribute "name". **/
  upload(req, res, function (err) {
    //添加错误处理
    if (err) {
      console.log(err);
      return;
    }
    req.file = req.files[0];
    var tmp_path = req.file.path;
    console.log(tmp_path, req.file, req.file.filename);
    /** The original name of the uploaded file
        stored in the variable "originalname". **/
    const target_name = `${req.file.filename}${req.file.originalname.match(/\.[^]*?$/)}`
    var target_path = `uploads/${target_name}`;

    /** A better way to copy the uploaded file. **/
    console.log(target_path);
    try {
      if (!fs.existsSync('public/uploads/')) {
        fs.mkdirSync('public/uploads/');
      }
      fs.rename(tmp_path, `public/${target_path}`, function (err) {
        if (!err) {
          console.log("rename complete.");
          //更新用户名  
          var conditions = { name: req.user.name };
          var updates = { $set: { url: target_path } };//将用户名更新为“tiny”  
          User.update(conditions, updates, function (error) {
            if (error) {
              console.error(error);
            } else {
              console.error("更新头像成功")
              //查询更新后的数据  
              User.findOne({ name: req.user.name }, function (error, doc) {
                if (error) {
                  console.error(error)
                } else {
                  res.json({ url: `${config.server}${doc.url}` })
                  console.error("更新后数据：", doc)
                }
              })
            }
          });

        }
      });
    } catch (error) {
      throw error;
    }
  });
});




router.get('/download', function (req, res) {
  console.log("---------访问下载路径-------------");
  var pathname = "/small.docx";
  var realPath = "assets" + pathname;
  fs.exists(realPath, function (exists) {
    if (!exists) {
      console.log("文件不存在");
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      });

      res.write("This request URL " + pathname + " was not found on this server.");
      res.end();
    } else {
      console.log("文件存在");
      fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
          res.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          console.log("读取文件错误");
          res.end(err);
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          });
          console.log("读取文件完毕，正在发送......");

          res.write(file, "binary");

          res.end();
          console.log("文件发送完毕");
        }
      });
    }
  });
});

// passport-http-bearer token 中间件验证
// 通过 header 发送 Authorization -> Bearer  + token
// 或者通过 ?access_token = token
router.get('/info',
  passport.authenticate('bearer', { session: false }),
  function (req, res) {
    const { name, real_name, url, role } = req.user;
    res.json({ name, real_name, role, url: `${config.server}${url}` });
  });
router.get('/alluser',
  passport.authenticate('bearer', { session: false }),
  checkPermission('admin'),
  function (req, res) {
    User.find({}, ['id', 'name', 'real_name', 'role'], (err, data) => {
      if (err) {
        console.log("err");
      } else {
        res.json(data);
        // console.log(data);
      }
    })
  });
module.exports = router;