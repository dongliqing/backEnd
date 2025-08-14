
import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import router from './router/router.js';

// const Koa = require('koa');
// const json = require('koa-json'); //将http响应的数据格式化为JSON
// const bodyParser = require('koa-bodyparser');//解析请求体
// const cors = require('@koa/cors'); //处理跨域请求
// const router = require('./router.js'); //引入路由模块

const app = new Koa();


app.use(cors()); //使用cors中间件处理跨域请求
app.use(json()); //使用json中间件将响应数据格式化为JSON
app.use(bodyParser()); //使用bodyParser中间件解析请求体
app.use(router.routes()); //使用路由中间件
app.use(router.allowedMethods()); //允许路由方法



app.listen(999, () => {
    console.log('Server is running on http://localhost:999');
}) 