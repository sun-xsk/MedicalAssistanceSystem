// import { httpReq } from "./httpReq";

// const upLoadFile = (filedata) => httpReq('post', '/file/uploadDicomFile', filedata, { "Content-type": "multipart/form-data" });

// const test = () => httpReq('get', '/check', '')
// export const httpUtil = {
//     upLoadFile,
//     test
// }
import { httpReq } from "./httpReq";

export default class httpUtill {
    // 获取登陆状态
    static getRegisterStatus = () => httpReq('get', '/check', '')
}