import OpenAI from "openai";
import dotenv from 'dotenv';
import { format } from 'date-fns';
// import readline from 'readline';
import axios from 'axios';

dotenv.config();



const openai = new OpenAI(
    {
        apiKey: process.env.QIANWEN_KEY,
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

        //根据城市名字查询城市id
        const url_get_id = `${process.env.HEFENGTIANQI_HOST}/geo/v2/city/lookup`;
        const response = await axios({
            type: "get",
            url: url_get_id,
            params: { location },
            headers: {
                Authorization: `Bearer ${process.env.HEFENGTIANQI_TOKEN}`,
            },
        });
        const data = response.data;
        //根据城市id查询近3天的天气
        const url_get_weather = `${process.env.HEFENGTIANQI_HOST}/v7/weather/3d`;
        const response2 = await axios({
            type: "get",
            url: url_get_weather,
            params: { location: data.location[0].id },
            headers: {
                Authorization: `Bearer ${process.env.HEFENGTIANQI_TOKEN}`,
            },
        });
        const data2 = response2.data;
        // console.log(data2);

        if (data2.code === '200') {
            // 成功获取天气数据
            const weatherInfo = data2.daily; // 获取第一天的天气预报
            console.log(weatherInfo)
            return `${weatherInfo[0].fxDate}（今天）：${location}的天气：${weatherInfo[0].textDay}，最高温度${weatherInfo[0].tempMax}°C，最低温度${weatherInfo[0].tempMin}°C。
            ${weatherInfo[1].fxDate}（明天）：${location}的天气：${weatherInfo[1].textDay}，最高温度${weatherInfo[1].tempMax}°C，最低温度${weatherInfo[1].tempMin}°C。
            ${weatherInfo[2].fxDate}（后天）：${location}的天气：${weatherInfo[2].textDay}，最高温度${weatherInfo[2].tempMax}°C，最低温度${weatherInfo[2].tempMin}°C。`;
        } else {
            // API 返回错误
            return `${location}的天气信息查询失败，错误代码：${data.code}`;
        }
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
    async main(ctx) {

        const messages = [
            { "role": "system", "content": `你是一个旅游助手，你的名字叫小火云。你可以提供旅游信息、查询天气等服务。
                如果用户查询明后天天气，回答时请标注出对应的年月日。`},
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

            // {
            //     "content": "",
            //     "role": "assistant",
            //     "tool_calls": [
            //         {
            //             "index": 0,
            //             "id": "call_16ce05e45c90479fa62e64",
            //             "type": "function",
            //             "function": {"name":"getCurrentWeather","arguments":"{\"days\": \"1\", \"location\": \"杭州市\"}"}
            //         }
            //     ]
            // }

            while ("tool_calls" in assistantOutput) {
                let toolInfo = {};
                if (assistantOutput.tool_calls[0].function.name == "getCurrentWeather") {
                    toolInfo = { "role": "tool" };
                    let location = JSON.parse(assistantOutput.tool_calls[0].function.arguments)["location"];
                    toolInfo["content"] = await ToolController.getCurrentWeather(location);
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
            console.log(`最终大模型输出信息：${assistantOutput.content}`);
  
            // console.log(completion.choices[0].message.content)
            // messages.push(completion.choices[0].message);
        }


        ctx.body = {
            code: "000000",
            message: "请求成功",
            data: assistantOutput.content
        }
        ctx.status = 200;

    }

}

const toolController = new ToolController();

export default toolController;
