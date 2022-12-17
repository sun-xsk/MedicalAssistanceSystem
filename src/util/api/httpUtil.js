import { Get, Post } from "./httpReq";

// 上传dicom文件
export const uploadFile = (filedata) =>
    Post('/file/uploadDicomFile', filedata, '', { "Content-Type": "multipart/form-data" });

// 测试接口
export const testConnect = () => Get('/file/testConnect')

// 获取文件信息，同一系列信息基本一样
export const getFileInfo = (filedata) =>
    Post('/file/getDicomFileInfo', filedata, { "attributes": "PatientID;PatientAge;PatientAddress" })

// 已经删除
export const getFilePath = (patientID) =>
    Post('/file/getDicomFilePath', '', { patientID })

// 通过序列号（InstanceNumber）和序列uid（SeriesInstanceUID）获取文件
export const getDicomFileBySeriesInstanceUIDAndInstanceNumber = (NumAndUID) =>
    Post('/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber', '',  NumAndUID)
