/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:59:09 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-05-20 19:59:09 
 * @Feature: 考题路由  
 */

import express from "express";
import passport from "../passport";
import Question from "../controller/question";
const router = express.Router();
const { importQuestion } = Question;

// 批量插入新的试题
router.post("/new", passport(), importQuestion);


export default router;