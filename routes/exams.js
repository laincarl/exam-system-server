const express = require('express');
const Exam = require('../models/exam');
const Question = require('../models/question');
const Result = require('../models/result');
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
  }).exec((err, exam) => {
    if (err) console.log(err);
    if (exam) {
      res.json(exam);
    } else {
      res.status(404);
      res.json({ message: '考试不存在' })
    }
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
//取单个考试结果
router.get('/result', passport.authenticate('bearer', { session: false }), (req, res) => {
  // console.log(res.query)
  const { name } = req.user;
  Result.findOne({ exam_id: req.query.id, name }, (err, data) => {
    if (err) console.log(err);
    if (data) {
      res.json(data);
    } else {
      res.status(404);
      res.json({ message: '考试结果不存在' })
    }
  })
})
router.post('/submit', passport.authenticate('bearer', { session: false }), (req, res) => {
  // console.log(req.body);
  //前端传回来题号组成的数组
  const { id, title, questions } = req.body;
  const { name } = req.user;
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
      const results = [];
      data.forEach(one => {
        const temp = { ...one._doc };
        delete one._id;
        temp.choices = [obj[one.id]];
        if (one.answers[0] === obj[one.id]) {
          console.log('对', one.title, one.answers)
          score += 1
        } else {
          console.log('错', one.title, one.answers)
        }
        console.log(temp);
        results.push(temp);
      })
      const newResult = new Result({
        exam_id: id,
        exam_title: title,
        name,
        score,
        results
      })
      newResult.save((err) => {
        if (err) {
          console.log(err);
          throw err;
        }
        res.json({ score, results });
      });
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