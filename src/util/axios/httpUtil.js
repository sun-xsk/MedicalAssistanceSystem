import { httpReq } from "./httpReq";
export const uploadFile = (filedata)=> 
    httpReq('post', '/file/uploadDicomFile', filedata, {"Content-type": "multipart/form-data"});
export const testConnect = () => 
    httpReq('get','/file/testConnect')
export const getFileInfo = (attributes,filedata) => 
    httpReq('post','/file/getDicomFileInfo',{attributes,'file':filedata})
export const getFilePath = (patientId) => 
    httpReq("post","/file/getDicomFilePath",patientId)
