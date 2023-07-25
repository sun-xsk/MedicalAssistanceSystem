import { Get, Post } from "./httpReq";
//测试连接
export const testConnect = () => Get("/file/testConnect", "");

//上传文件  参数dicom文件
export const uploadDicomFile = (filedata) =>
	Post("/file/uploadDicomFile", filedata, "", {
		"Content-Type": "multipart/form-data",
	});

// 上传文件夹，在调这个
export const uploadFile = (filedata) =>
	Post("/file/upload", filedata, "", {
		"Content-Type": "multipart/form-data",
	});

// 获得四个角信息
export const getSeriesInfo = (seriesInstanceUID) =>
	Get(`/file/getSeriesInfo?seriesInstanceUID=${seriesInstanceUID}`);

// 保存批注
export const saveAnnotationFun = (seriesInstanceUID, label) =>
	Post('/label/save', {
		seriesInstanceUID,
		label
	})

// 获取标注
export const getAnnotation = (seriesInstanceUID) =>
	Get(`/label/getInfo?seriesInstanceUID=${seriesInstanceUID}`)

// 下载文件
export const getFile = (seriesInstanceUID, instanceNumber) =>
	Get(`/file/getFile?seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`, {}, 'arraybuffer')

//获取dicom文件，instanceNumber文件序列号，seriesInstanceUID序列uid
export const getDicomFile = (seriesInstanceUID, instanceNumber) =>
	Get("/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber", {
		seriesInstanceUID,
		instanceNumber,
	});

//获取窗口信息
export const getMainShow = (filedata) =>
	Post("/file/getMainShow", filedata, "", {
		"Content-Type": "multipart/form-data",
	});

//获取病人信息  参数dicom文件
export const getFileInfo = (filedata) =>
	Post("/file/getDicomFileInfo", filedata, {
		attributes:
			"PatientID;PatientAge;PatientAddress;SeriesInstanceUID;Modality;PatientID;StudyDate;AccessionNumber;PatientName;PatientAddress",
	});

//获取指定uid下的文件序列号  参数是序列uid，返回值类型为数组
export const getInstanceNumbers = (seriesInstanceUID) =>
	Get("/file/getInstanceNumbers", { seriesInstanceUID });

//获取对应病人的dcm信息
export const getDicomFileByPatientId_StudyDate_SeriesInstanceUID = (
	patientId,
	seriesInstanceUID,
	StudyDate
) =>
	Get("/file/getDicomFileByPatientId_StudyDate_SeriesInstanceUID", {
		seriesInstanceUID,
		patientId,
		StudyDate,
	});

// 图像去噪
export const limpidDcmList = (seriesInstanceUID, instanceNumber, type) =>
	Get("/file/getDenoisingFileBySeriesInstanceUIDAndInstanceNumber", {
		seriesInstanceUID,
		instanceNumber,
		type,
	});
