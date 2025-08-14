class UserController {
    //用户登录
    async login(ctx) {
        const { name } = ctx.request.body; //获取请求体中的数据
        ctx.body = {
            code: "000000",
            message: "请求成功",
            data: name,
        }
        ctx.status = 200; //设置响应状态码为200
    }
    async getDetail(ctx) {
        const { id } = ctx.query; //获取请求体中的数据
        // console.log('query', query)
        ctx.response.type = 'application/json';
        ctx.body = {
            code: "000000",
            message: "请求成功",
            data: { id, name: "小云" },
        }
        ctx.status = 200; //设置响应状态码为200
    }
}

const userController = new UserController();

export default userController;
