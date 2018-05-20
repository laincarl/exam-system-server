/*
 * @Author: LainCarl 
 * @Date: 2018-05-20 19:54:29 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2018-05-20 19:54:29 
 * @Feature: 题库路由 
 */

import express from "express";
import passport from "../passport";
import Bank from "../controller/bank";
const router = express.Router();
const { getAllBank, getBank, newBank } = Bank;

//取所有题库
router.get("/", getAllBank);
//根据id取单个题库
router.get("/bank", passport(["admin", "teacher"]), getBank);
// 添加新题库
router.post("/new", passport(), newBank);

export default router;