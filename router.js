import Router from 'koa-router';
import user from './controller/user.js';
import weather from './controller/weather.js';
import model from './controller/model.js';
import tools from './controller/tools.js';
 
const router = new Router();
 
router.post('/api/wxlogin', user.wxlogin);
router.get('/api/weather', weather.getDetail);

router.post('/api/textChat', model.textChat);
router.post('/api/streamTextChat', model.streamTextChat);
router.post('/api/multiRoundsStreamTextChat', model.MultiRoundsStreamTextChat);
router.post('/api/textChatUseTool', tools.getWeather);


export default router;