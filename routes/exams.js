const express = require('express');
const Exam = require('../models/exam');
const Question = require('../models/question');
const jwt = require('jsonwebtoken');
const config = require('../config');
const passport = require('passport');
const router = express.Router();

require('../passport')(passport);

function getRandomFromArr(arr, num) {
  let len = arr.length;
  // console.log(arr);
  if (len <= num) {
    return arr;
  } else {
    let result = [];
    for (let i = 0; i < 10; i++) {
      let index = ~~(Math.random() * len) + i;
      result[i] = arr[index];
      arr[index] = arr[i];
      len--;
    }
    return result;
  }
}

//取所有考试
router.get('/', (req, res) => {
  Exam.find({}).populate('questions').exec((err, story) => {
    if (err) console.log(err);
    res.json(story);
    // console.log(story.questions);
  })
  // Exam.find({}, ['-_id', '-questions._id'], (err, data) => {
  //   if (err) {
  //     console.log("err");
  //   } else {
  //     res.json(data);
  //   }
  // })
})
//取单个考试
router.get('/exam', (req, res) => {
  // console.log(res.query)
  Exam.findOne({ id: req.query.id }).populate({
    path: 'questions',
    select: 'id title selects'
  }).exec((err, story) => {
    if (err) console.log(err);
    res.json(story);
    // console.log(story.questions);
  })
  // Exam.find({}, ['-_id', '-questions._id'], (err, data) => {
  //   if (err) {
  //     console.log("err");
  //   } else {
  //     res.json(data);
  //   }
  // })
})
router.post('/submit', (req, res) => {
  // console.log(req.body);
  //前端传回来题号组成的数组
  const questions = req.body;
  const ids = questions.map(one => one.id);
  Question.find({ id: { $in: ids } }, (err, data) => {
    if (err) {
      console.log(err);
      console.log("err");
    } else {
      let score = 0;
      let obj = {};
      questions.forEach(one => {
        obj[one.id] = one.answers[0];
      })
      data.forEach(one => {
        if (one.answers[0] === obj[one.id]) {
          console.log('对',one.title,one.answers)
          score += 1
        }else{
          console.log('错',one.title,one.answers)
        }
      })
      res.send({ score });
    }
  })
})
// 建立新的考试
router.post('/new', (req, res) => {
  if (!req.body) {
    console.log(req.body);
    res.json({ success: false, message: '请输入您的账号密码.' });
  } else {
    const { title } = req.body;
    Question.find({}, ['_id', 'id'], (err, data) => {
      if (err) {
        console.log("err");
      } else {
        // res.json(data);
        // res.json(getRandomFromArr(data, 10))
        var newExam = new Exam({
          title,
          questions: getRandomFromArr(data, 10),
        });
        newExam.save((err) => {
          if (err) {
            console.log(err);
            throw err;
          }
          res.json({ success: true, message: '创建成功!' });
        });
        console.log(data);
      }
    })


    // const { title } = req.body;
    // var newExam = new Exam({
    //   title,
    // });
    // newExam.save((err) => {
    //   if (err) {
    //     console.log(err);
    //     throw err;
    //   }
    //   res.json({ success: true, message: '创建成功!' });
    // });
  }
});


module.exports = router;