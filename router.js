import Router from 'koa-router';
import user from './controller/user.js';
import weather from './controller/weather.js';
import model from './controller/model.js';

// const Router = require('koa-router');
const router = new Router();

// const user = require('./controller/user'); //引入用户控制器

router.post('/api/wxlogin', user.wxlogin);
router.get('/api/weather', weather.getDetail);
router.post('/api/textChat', model.textChat);
router.post('/api/streamTextChat', model.streamTextChat);
router.post('/api/multiRoundsStreamTextChat', model.MultiRoundsStreamTextChat);


export default router;