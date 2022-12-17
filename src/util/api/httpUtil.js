import { Get,Post } from "./httpReq";
export const uploadFile = (filedata)=> Post('/file/uploadDicomFile', filedata,'', {"Content-Type": "multipart/form-data"});
export const testConnect = () => Get('/file/testConnect')
export const getFileInfo = (filedata) => Post('/file/getDicomFileInfo',filedata,{"attributes":"PatientID;PatientAge;PatientAddress"})
export const getFilePath = (patientID) => Post('/file/getDicomFilePath','',{patientID})
 