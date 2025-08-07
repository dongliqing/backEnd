class UserController{
    //用户登录
    async wxlogin(ctx) {  
        const {id} = ctx.request.body; //获取请求体中的数据
        console.log('123', id)
    }
}

// module.exports = new UserController();
const userController = new UserController();

export default userController;
