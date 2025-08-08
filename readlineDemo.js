import readline from 'readline';

const rl = readline.createInterface({ // 创建一个可读流
    input: process.stdin, // 输入流
    output: process.stdout // 输出流
});

rl.question("请问你的名字是: ", (question) => {
    console.log(`用户的名字是: ${question}`);
    rl.close();
});

rl.on('close', () => {
    console.log('停止服务');
});