



class WeatherController {
    //用户登录
    async getDetail(ctx) {
        const query = ctx.query; //获取请求体中的数据
        console.log('query', query)
        ctx.body = {
            code: "000000",
            message: "请求成功",
            data: [1, 2, 3],
        }
        ctx.status = 200; //设置响应状态码为200
    }
}

const weatherController = new WeatherController();

export default weatherController;
