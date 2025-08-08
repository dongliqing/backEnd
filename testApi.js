import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const apiKey = process.env.HEFENGTIANQI_KEY;
    console.log(apiKey)
    try {
        const url1 = `n23yfqq35k.re.qweatherapi.com/geo/v2/city/lookup?location=杭州`;
        const response = await fetch({
            type: "get",
            url: url1,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'X-QW-Api-Key': "Q962F387D9"
            },
        });
        const data = response.data;
        console.log(data);
    } catch (error) {
        console.log(error)
    }





    // // 使用和风天气 API 查询指定城市的天气
    // const url = `https://devapi.qweather.com/v7/weather/30d?location=杭州`;

    // const response = await axios.get(url, {
    //     headers: {
    //         Authorization: `Bearer ${apiKey}`,
    //     },
    // });
    // const data = response.data;

    // if (data.code === '200') {
    //     // 成功获取天气数据
    //     const weatherInfo = data.daily[0]; // 获取第一天的天气预报
    //     console.log(weatherInfo)
    //     return `${location}今天天气：${weatherInfo.textDay}，最高温度${weatherInfo.tempMax}°C，最低温度${weatherInfo.tempMin}°C。`;
    // } else {
    //     // API 返回错误
    //     return `${location}的天气信息查询失败，错误代码：${data.code}`;
    // }

}

main();
