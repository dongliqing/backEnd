import { SignJWT, importPKCS8 } from "jose";
import { webcrypto } from 'crypto'; // 显式导入 crypto

// 如果需要，可以将 webcrypto 设置为全局变量
global.crypto = webcrypto;

const YourPrivateKey = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIEnZUaOTvv3j2pLnFVcXVkLUqpx6nYSYwq0jVkGUXyB0
-----END PRIVATE KEY-----`;  // 私钥

importPKCS8(YourPrivateKey, 'EdDSA').then((privateKey) => {
    const customHeader = {
        alg: 'EdDSA',
        kid: 'KJB3ENM72M'  //JWT凭据ID
    }
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 3600; //n秒后过期
    const customPayload = {
        sub: '2CTM84CK6Q',  //项目ID
        iat: iat,
        exp: exp
    }
    new SignJWT(customPayload)
        .setProtectedHeader(customHeader)
        .sign(privateKey)
        .then(token => console.log('JWT: ' + token))
}).catch((error) => console.error(error))