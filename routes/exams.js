/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:37:43 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-05-20 19:37:43 
 * @Feature: exam的router 
 */

import express from "express";
import passport from "../passport";
import Exam from "../controller/exam";
const router = express.Router();

const { getAllExam, getExam, deleteExam, getResults, getResultsAdmin, getResult, submit, newExam } = Exam;
//取所有考试
router.get("/", passport(), getAllExam);
//取单个考试
router.get("/exam", passport(), getExam);
//关闭一个考试，伪删除
router.delete("/exam", passport(), deleteExam);
//取所有考试结果
router.get("/manage/results", passport(), getResultsAdmin);
//普通用户取所有考试结果
router.get("/results", passport(), getResults);
//取单个考试结果
router.get("/result", passport(), getResult);
//提交考试结果
router.post("/submit", passport(), submit);
// 建立新的考试
router.post("/new", passport(), newExam);


export default router;