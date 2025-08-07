import OpenAI from "openai";
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: process.env.QIANWEN_KEY,
        // apiKey: process.env.QIANWEN_KEY,  
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);


const messages = [
    { role: "system", content: "你是一个旅游助手，你的名字叫小董。你可以提供旅游信息、查询天气和火车票等服务。" },
    // { role: "user", content: "你是谁？" }
]

class ModelController {
    //文本交流 一次性输出
    async textChat(ctx) {


        const completion = await openai.chat.completions.create({
            // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
            model: "qwen-turbo",  // qwen-plus 属于 qwen3 模型，如需开启思考模式，请参见：https://help.aliyun.com/zh/model-studio/deep-thinking
            messages: [
                { role: "system", content: "你是一个旅游助手，你的名字叫云游官。你可以提供旅游信息、查询天气和火车票等服务。" },
                { role: "user", content: ctx.request.body.content }
            ],
        });

        ctx.body = {
            code: "000000",
            message: "请求成功",
            data: completion.choices[0].message.content,
        }
        ctx.status = 200; //设置响应状态码为200

        // console.log(ctx.request.body);
        // console.log(completion.choices[0].message.content)
        // messages.push(completion.choices[0].message);
    }

    //文本交流 流式输出
    async streamTextChat(ctx) {

        // 设置流式响应的headers
        ctx.set({
            'Content-Type': 'text/event-stream',  //浏览器会根据这个头部信息识别并处理流式数据
            'Cache-Control': 'no-cache',  // 禁用缓存，确保每次都能获取到最新的实时数据，避免中间环节对流式响应进行缓存
            'Connection': 'keep-alive',  //保持连接活跃状态，允许在同一个连接上持续传输数据
        });

        // Create a readable stream
        const stream = new Readable();
        ctx.body = stream;  // 启用流式响应

        const completion = await openai.chat.completions.create({
            // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
            model: "qwen-turbo",  // qwen-plus 属于 qwen3 模型，如需开启思考模式，请参见：https://help.aliyun.com/zh/model-studio/deep-thinking
            messages: [
                { role: "system", content: "你是一个旅游助手，你的名字叫小董。你可以提供旅游信息、查询天气和火车票等服务。" },
                { role: "user", content: ctx.request.body.content }
            ],
            stream: true,
            stream_options: {
                include_usage: true, // 是否返回Token使用量
            }
        });

        let fullContent = "";
        for await (const chunk of completion) {
            // 如果stream_options.include_usage为true，则最后一个chunk的choices字段为空数组，需要跳过（可以通过chunk.usage获取 Token 使用量）
            if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
                const content = chunk.choices[0].delta.content || '';
                fullContent += content;

                console.log(chunk.choices[0].delta);

                //write 方法将数据以块的形式流式传输给客户端
                ctx.res.write("data:" + JSON.stringify({ content }) + "\n\n");
            } else {
                //打印token使用量
                console.log(chunk.usage);
            }
        }

        ctx.res.end();  // 结束响应

        // messages.push({ role: "assistant", content: fullContent });

    }


    //多轮对话 流式输出
    async MultiRoundsStreamTextChat(ctx) {

        // 设置流式响应的headers
        ctx.set({
            'Content-Type': 'text/event-stream',  //浏览器会根据这个头部信息识别并处理流式数据
            'Cache-Control': 'no-cache',  // 禁用缓存，确保每次都能获取到最新的实时数据，避免中间环节对流式响应进行缓存
            'Connection': 'keep-alive',  //保持连接活跃状态，允许在同一个连接上持续传输数据
        });

        // Create a readable stream
        const stream = new Readable();
        ctx.body = stream;  // 启用流式响应

        messages.push({ role: "user", content: ctx.request.body.content });
        console.log(messages);

        const completion = await openai.chat.completions.create({
            // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
            model: "qwen-turbo",  // qwen-plus 属于 qwen3 模型，如需开启思考模式，请参见：https://help.aliyun.com/zh/model-studio/deep-thinking
            messages: messages,
            stream: true,
            stream_options: {
                include_usage: true, // 是否返回Token使用量
            }
        });

        let fullContent = "";
        for await (const chunk of completion) {
            // 如果stream_options.include_usage为true，则最后一个chunk的choices字段为空数组，需要跳过（可以通过chunk.usage获取 Token 使用量）
            if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
                const content = chunk.choices[0].delta.content || '';
                fullContent += content;

                console.log(chunk.choices[0].delta);

                //write 方法将数据以块的形式流式传输给客户端
                ctx.res.write("data:" + JSON.stringify({ content }) + "\n\n");
            } else {
                //打印token使用量
                console.log(chunk.usage);
            }
        }

        ctx.res.end();  // 结束响应

        messages.push({ role: "assistant", content: fullContent });
    }

}

const modelController = new ModelController();

export default modelController;
