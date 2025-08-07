import OpenAI from "openai";
import dotenv from 'dotenv';
import { format } from 'date-fns';
import readline from 'readline';


dotenv.config();



const openai = new OpenAI(
    {
        apiKey: process.env.QIANWEN_KEY,
        // apiKey: process.env.QIANWEN_KEY,  
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    }
);

const tools = [
    // 工具1 获取当前时刻的时间
    {
        "type": "function",
        "function": {
            "name": "getCurrentTime",
            "description": "当你想知道现在的时间时非常有用。",
            // 因为获取当前时间无需输入参数，因此parameters为空
            "parameters": {}
        }
    },
    // 工具2 获取指定城市的天气
    {
        "type": "function",
        "function": {
            "name": "getCurrentWeather",
            "description": "查询指定城市的天气",
            "parameters": {
                "type": "object",
                "properties": {
                    // 查询天气时需要提供位置，因此参数设置为location
                    "location": {
                        "type": "string",
                        "description": "城市或县区，比如北京市、杭州市、余杭区等。"
                    }
                },
                "required": ["location"]
            }
        }
    }
];

 
class ToolController {
    static getCurrentWeather(location) {
        return `${location}今天是雨天。`;
    }
    static getCurrentTime() {
        // 获取当前日期和时间
        const currentDatetime = new Date();
        // 格式化当前日期和时间
        const formattedTime = format(currentDatetime, 'yyyy-MM-dd HH:mm:ss');
        // 返回格式化后的当前时间
        return `当前时间：${formattedTime}。`;
    }
    static async getResponse(messages) {
        const response = await openai.chat.completions.create({
            model: "qwen-turbo",   
            messages: messages,
            tools: tools,
        });
        return response;
    }

    // 一次性输出
    async getWeather(ctx) {
        const rl = readline.createInterface({ // 创建一个可读流
            input: process.stdin, // 输入流
            output: process.stdout // 输出流
        });
        console.log(process.stdin, process.stdout);

        rl.question("user: ", async (question) => {
            const messages = [{ "role": "user", "content": question }];
            let i = 1;
            const firstResponse = await ToolController.getResponse(messages);
            let assistantOutput = firstResponse.choices[0].message;
            console.log(`第${i}轮大模型输出信息：${JSON.stringify(assistantOutput)}`);
            if (Object.is(assistantOutput.content, null)) { // 判断是否为null
                assistantOutput.content = "";
            }
            messages.push(assistantOutput);
            if (!("tool_calls" in assistantOutput)) {
                console.log(`无需调用工具，我可以直接回复：${assistantOutput.content}`);
                rl.close();
            } else {
                while ("tool_calls" in assistantOutput) {
                    let toolInfo = {};
                    if (assistantOutput.tool_calls[0].function.name == "getCurrentWeather") {
                        toolInfo = { "role": "tool" };
                        let location = JSON.parse(assistantOutput.tool_calls[0].function.arguments)["location"];
                        toolInfo["content"] = getCurrentWeather(location);
                    } else if (assistantOutput.tool_calls[0].function.name == "getCurrentTime") {
                        toolInfo = { "role": "tool" };
                        toolInfo["content"] = getCurrentTime();
                    }
                    console.log(`工具输出信息：${JSON.stringify(toolInfo)}`);
                    console.log("=".repeat(100));
                    messages.push(toolInfo);
                    assistantOutput = (await ToolController.getResponse(messages)).choices[0].message;
                    if (Object.is(assistantOutput.content, null)) {
                        assistantOutput.content = "";
                    }
                    messages.push(assistantOutput);
                    i += 1;
                    console.log(`第${i}轮大模型输出信息：${JSON.stringify(assistantOutput)}`)
                }
                console.log("=".repeat(100));
                console.log(`最终大模型输出信息：${JSON.stringify(assistantOutput.content)}`);
                rl.close();
            }
        });


        // ctx.body = {
        //     code: "000000",
        //     message: "请求成功",
        //     data: completion.choices[0].message.content,
        // }
        // ctx.status = 200; //设置响应状态码为200


        // console.log(ctx.request.body);
        // console.log(completion.choices[0].message.content)
        // messages.push(completion.choices[0].message);
    }


}

const toolController = new ToolController();

export default toolController;
