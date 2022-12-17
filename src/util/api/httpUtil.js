import { Get, Post } from "./httpReq";

// 测试接口
export const testConnect = () => Get('/file/testConnect')

// 上传dicom文件
export const uploadFile = (filedata) =>
    Post('/file/uploadDicomFile', filedata, '', { "Content-Type": "multipart/form-data" });

// 通过序列号（InstanceNumber）和序列uid（SeriesInstanceUID）获取文件
export const getDicomFile = (NumAndUID) =>
    Post('/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber', '', NumAndUID)

// 获取窗口信息
export const getMainShow = (filedata) => Post("/file/getMainShow", filedata,
    '', { "Content-type": "multipart/form-data" });
// 获取文件信息，同一系列信息基本一样
export const getFileInfo = (filedata) =>
    Post('/file/getDicomFileInfo', filedata, { "attributes": "PatientID;PatientAge;PatientAddress" })
