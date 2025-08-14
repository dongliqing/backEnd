import Router from 'koa-router';
import user from '../controller/user.js';
import model from '../controller/model.js';
import tools from '../controller/tools.js';
import structuring from '../controller/structuring.js';
 
const router = new Router();
 
router.get('/api/getUserDetail', user.getDetail);
router.post('/api/userLogin', user.login);

 
//单轮文本对话
router.post('/api/textChat', model.textChat);
//流式输出文本
router.post('/api/streamTextChat', model.streamTextChat);
//多轮对话
router.post('/api/multiRoundsStreamTextChat', model.MultiRoundsStreamTextChat);
//使用工具
router.post('/api/textChatUseTool', tools.getWeather);
//结构化输出
router.post('/api/textChatUseToolFormat', structuring.getWeather);


export default router;