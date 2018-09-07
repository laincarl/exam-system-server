export default {
	"server": "https://localhost:9000/",
	"secret": "learnRestApiwithNickjs", // JSON Web Token 加密密钥设置
	"expiresIn": 2592000,//一个月
	"database": "mongodb://localhost:27017/exam" // 填写本地自己 mongodb 连接地址,xxx为数据表名
};