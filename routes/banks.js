const express = require('express');
const Bank = require('../models/Bank');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const router = express.Router();

require('../passport')(passport);

//取所有试题
router.get('/', (req, res) => {
  Bank.find({}, (err, data) => {
    if (err) {
      console.log("err");
    } else {
      res.json(data);
      // console.log(data);
    }
  })
})
// 批量插入新的试题
router.post('/new', passport.authenticate('bearer', { session: false }), (req, res) => {
  if (!req.body) {
    console.log(req.body);
    res.json({ success: false, message: '请输入您的账号密码.' });
  } else {
    const { title } = req.body;
    var newBank = new Bank({
      title,
    });
    newBank.save((err) => {
      if (err) {
        console.log(err);
        throw err;
      }
      res.json({ success: true, message: '创建成功!' });
    });
  }
});


module.exports = router;