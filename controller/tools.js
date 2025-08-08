import OpenAI from "openai";
import dotenv from 'dotenv';
import { format } from 'date-fns';
// import readline from 'readline';
import axios from 'axios';

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
    //查询天气
    static async getCurrentWeather(location) {
        // 使用和风天气 API 查询指定城市的天气
        const apiKey = process.env.HEFENGTIANQI_KEY;
        const url = `https://devapi.qweather.com/v7/weather/30d?location=${encodeURIComponent(location)}&key=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.code === '200') {
            // 成功获取天气数据
            const weatherInfo = data.daily[0]; // 获取第一天的天气预报
            console.log(weatherInfo)
            return `${location}今天天气：${weatherInfo.textDay}，最高温度${weatherInfo.tempMax}°C，最低温度${weatherInfo.tempMin}°C。`;
        } else {
            // API 返回错误
            return `${location}的天气信息查询失败，错误代码：${data.code}`;
        }

        return `${location}今天是雨天。`;
    }

    //查询当前时间
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
            model: "qwen-plus",
            messages: messages,
            tools: tools,
        });
        return response;
    }

    // 一次性输出
    async getWeather(ctx) {

        const messages = [
            { "role": "system", "content": "你是一个天气查询小助手。" },
            // 但是你不知道当前的日期和时间，如果用户想知道当前的年月日或时间，请使用function calls工具查询结果。
            { "role": "user", "content": ctx.request.body.content }
        ];
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
        } else {
            while ("tool_calls" in assistantOutput) {
                let toolInfo = {};
                if (assistantOutput.tool_calls[0].function.name == "getCurrentWeather") {
                    toolInfo = { "role": "tool" };
                    let location = JSON.parse(assistantOutput.tool_calls[0].function.arguments)["location"];
                    toolInfo["content"] = ToolController.getCurrentWeather(location);
                } else if (assistantOutput.tool_calls[0].function.name == "getCurrentTime") {
                    toolInfo = { "role": "tool" };
                    toolInfo["content"] = ToolController.getCurrentTime();
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

}

const toolController = new ToolController();

export default toolController;
