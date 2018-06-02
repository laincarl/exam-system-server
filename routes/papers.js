/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:48:32 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-05-20 19:48:32 
 * @Feature: 试卷路由  
 */

import express from "express";
import passport from "../passport";
import Paper from "../controller/paper";
const router = express.Router();
const { getAllPaper, getPaper, newPaper } = Paper;

//取所有试卷
router.get("/", passport(["admin", "teacher"]), getAllPaper);
//取单个试卷
router.get("/paper", passport(), getPaper);
// 建立新的试卷
router.post("/new", passport(["admin", "teacher"]), newPaper);


export default router;