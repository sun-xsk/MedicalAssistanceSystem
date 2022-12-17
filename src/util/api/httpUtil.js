import { Get,Post } from "./httpReq";
//测试连接
export const testConnect = () => Get('/file/testConnect','')

//上传文件  参数dicom文件
export const uploadFile = (filedata)=> Post('/file/uploadDicomFile', filedata,
    '', {"Content-Type": "multipart/form-data"});
//获取dicom文件，instanceNumber文件序列号，seriesInstanceUID序列uid
export const getDicomFile = (seriesInstanceUID,instanceNumber ) => 
    Get("/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber",
    {seriesInstanceUID,instanceNumber})
//获取窗口信息
export const getMainShow = (filedata) => Post("/file/getMainShow",filedata,
    '', {"Content-Type": "multipart/form-data"})

//获取病人信息  参数dicom文件
export const getFileInfo = (filedata) => Post('/file/getDicomFileInfo',filedata,
    {"attributes":"PatientID;PatientAge;PatientAddress"}) 

//获取指定uid下的文件序列号  参数是序列uid，返回值类型为数组
export const getInstanceNumbers = (seriesInstanceUID) => 
    Get("/file/getInstanceNumbers",{seriesInstanceUID})




