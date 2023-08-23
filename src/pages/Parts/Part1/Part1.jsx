import React, { useState, useRef, useEffect } from "react";
import { message } from "antd";
import {
	cornerstone,
	cornerstoneWADOImageLoader,
	cornerstoneTools,
	filter,
	concurrencyRequest,
} from "@/util/js";
import Item from './Item/Item'
import {
	uploadFile
} from "@/util/api";
import myStore, {
	addLabeltoState
} from "@/util/store/store";
import Header from "../Header/Header";
import "./Part1.scss";
import { BasicFunBtn } from "@/components";
import { getAnnotation, getFile, getSeriesInfo, saveAnnotationFun } from "../../../util/api";
import { useParams } from "react-router-dom";
import { DetailContainer } from "./DetailContainer";
import { MessageCom } from "../../../components";

let activeToolName = ""; // 激活工具名称
let prevToolName = ""; // 上一个激活工具名称
let uuids = [];

function marker() {
	return {
		configuration: {
			markers: ["F5", "F4", "F3", "F2", "F1"], //标记数组
			current: "F3", //要对应markers
			loop: true, //是否循环
			ascending: false, //true 降序 false 升序
			changeTextCallback: function (data, eventData, doneChangingTextCallback) {
				data.visible = true; //是否可见, 默认true
				data.color = "#38f"; //文字颜色
				data.text = "内容"; //修改内容  这里修改了也没有，因为默认使用第二个参数
				doneChangingTextCallback(data, prompt("改变标注:"));
			},
		},
	};
}

export function Part1() {
	const fileRef = useRef(null);
	const imgRef = useRef(null);
	const params = useParams();
	// 得到左侧元素设置 scrollTop
	const leftDom = useRef(null);
	const paramsSeriesInstanceUID = params?.seriesInstanceUID || '';
	const [viewPort, setViewPort] = useState({});
	// 位置信息
	const [position, setPosition] = useState({ x: 0, y: 0 });
	// 四个角显示的信息
	const [patientInfo, setPatientInfo] = useState({
		PatientName: '',
		PatientID: '',
		PatientAge: '',
		PatientAddress: '',
		Modality: '',
		StudyDate: '',
		AccessionNumber: 0
	});
	// 是否上传了文件
	const [isUploadFile, setIsUploadFile] = useState(false);
	// 看意思是存储右侧信息
	const [details, setDetails] = useState([]);
	// 工具的加入与否
	const [isAddTool, setIsAllTool] = useState({});
	// 记录seriesInstanceUID
	const [seriesInstanceUID, setSeriesInstanceUID] = useState('');
	// 记录所有标注
	const [annotation, setAnnotation] = useState({});
	const [count, setCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);
	const [isShowMessage, setIsShowMessage] = useState(false);
	const [isUploadOrGetImage, setIsUploadOrGetImage] = useState(false);
	// 记录所有 imageId
	const [allImageId, setAllImageId] = useState([]);
	// 设置当前的 序列号
	const [curIndex, setCurIndex] = useState(0);

	useEffect(() => {
		setAnnotation({});
		cornerstone.enable(imgRef.current);

		setDetails(myStore.getState().labelDetails);
		myStore.subscribe(() => {
			const newLableDetails = myStore.getState().labelDetails;
			// console.log('newLableDetails', newLableDetails);
			setDetails(e => Array.from(new Set([...e, ...newLableDetails])));
			// const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
			// const nowToolState = toolStateManager.toolState;
			// setDetails(nowToolState);
		});

		//添加绘图事件
		imgRef.current.addEventListener(
			cornerstoneTools.EVENTS.MEASUREMENT_COMPLETED,
			(e) => {
				let detail = e.detail.measurementData;
				detail.tagName = " ";
				detail.toolName = e.detail.toolName;

				let ifhad = false;
				uuids.forEach((item) => {
					if (item == detail.uuid) {
						ifhad = true;
					}
				});

				if (!ifhad) {
					uuids.push(detail.uuid);
					setTimeout(() => {
						const detailString = JSON.stringify(detail);
						myStore.dispatch(addLabeltoState(detailString));
					}, 100);
				}
			}
		);

		imgRef.current.addEventListener(
			cornerstoneTools.EVENTS.STACK_SCROLL,
			(e) => {
				setCurIndex(e.detail.newImageIdIndex || 0);
				if (leftDom.current) {
					leftDom.current.scrollTop = e.detail.newImageIdIndex * 200;
				}
			}
		)

		setViewPort((viewPort) => ({
			...viewPort,
			voi: { windowWidth: "", windowCenter: "" },
			scale: 0,
		}));
	}, []);

	useEffect(() => {
		if (imgRef.current && isUploadFile) {
			setAnnotationInLocal();
		}
	}, [details])

	// 适用于从已有的获取
	useEffect(() => {
		setAnnotation({});
		const files = sessionStorage.getItem('files');
		const seriesInstanceUID = sessionStorage.getItem('seriesInstanceUID');
		if ((files && paramsSeriesInstanceUID !== 'noId' && seriesInstanceUID === paramsSeriesInstanceUID) ||
			(files && paramsSeriesInstanceUID === 'noId')) {
			loadImage(JSON.parse(files));
		} else if (paramsSeriesInstanceUID !== 'noId') {
			setSeriesInstanceUID(paramsSeriesInstanceUID);
			(async () => {
				const resFileINFO = await getSeriesInfo(paramsSeriesInstanceUID);
				const { accessionNumber, modality, patientAge, patientId, patientName, patientSex, studyDate, instanceNumbers } = resFileINFO.status === 200 ? resFileINFO.data : {};
				const instanceNumber = JSON.parse(instanceNumbers || '[]');
				setPatientInfo({
					AccessionNumber: accessionNumber,
					PatientName: patientName,
					PatientSex: patientSex,
					Modality: modality,
					PatientAge: patientAge,
					PatientID: patientId,
					StudyDate: studyDate
				});
				setCount(0);
				setTotalCount(instanceNumber.length);
				setIsShowMessage(true);
				const resInfo = await concurrencyRequest(instanceNumber, 5, setCount, getFile, paramsSeriesInstanceUID)
				setIsShowMessage(false);
				const files = [];
				resInfo.forEach(item => {
					const blob = new Blob([item]);
					const file = new File([blob], 'name');
					files.push(file);
				})
				loadImage(files);
				message.success('获取成功');
				setIsUploadFile(true);
				restoreData(paramsSeriesInstanceUID);
			})()
		}
	}, []);

	const getImageId = (seriesInstanceUID, instanceNumber) => {
		return (
			"wadouri:" +
			"http://8.130.137.118:8080/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?" +
			`seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`
		);
	};

	function chooseTool(name) {
		return () => {
			const tool = name;
			if (!tool) return;
			if (prevToolName) {
				cornerstoneTools.setToolPassiveForElement(
					imgRef.current,
					prevToolName,
					{
						mouseButtonMask: 1,
					}
				); // 把上一个激活工具冻结
			}
			activeToolName = tool + "Tool";
			if (!isAddTool[activeToolName]) {
				// 不能重复 addTool
				cornerstoneTools.addToolForElement(
					imgRef.current,
					cornerstoneTools[activeToolName],
					tool === "TextMarker" ? marker() : {}
				);
				setIsAllTool(e => ({ ...e, [activeToolName]: true }));
			}
			prevToolName = tool;
			// 激活工具
			cornerstoneTools.setToolActiveForElement(imgRef.current, tool, {
				mouseButtonMask: 1,
			});
		};
	}

	function uploadFiles() {
		fileRef.current.click();
	}

	async function loadImage(files) {
		const imageIds = [];

		Array.from(files).forEach((file) => {
			const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
			imageIds.push(imageId);
			setAllImageId(preState => {
				preState.push(imageId);
				return preState;
			})
		});

		const image = await cornerstone.loadImage(imageIds[0]);
		cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
		const stack = {
			currentImageIdIndex: 0,
			imageIds,
		};
		// 为启用元素添加 stack 工具状态
		cornerstoneTools.addToolState(imgRef.current, "stack", stack);
		cornerstone.displayImage(imgRef.current, image);
	}

	async function loadFiles(e) {
		setIsUploadOrGetImage(true);
		// fullScreen();
		const files = e.target.files;
		if (files.length === 0) return;
		const [formDataArr] = filter(files, 1);
		clearAllAnnotations();

		setTotalCount(formDataArr.length);
		setIsShowMessage(true);

		const res = await concurrencyRequest(formDataArr, 5, setCount, uploadFile);
		const isSuccess = res.every(item => item.status === 200);
		setIsShowMessage(false);
		if (isSuccess) {
			// 本地读取文件 并且显示
			loadImage(files)

			const seriesInstanceUID = res[0].data[0].seriesInstanceUID;
			setSeriesInstanceUID(seriesInstanceUID);
			const resFileINFO = await getSeriesInfo(seriesInstanceUID);
			if (resFileINFO.status !== 200) {
				return message.error(resFileINFO.msg || '上传失败');
			}
			message.success('上传成功');
			const { accessionNumber, modality, patientAge, patientId, patientName, patientSex, studyDate } = resFileINFO.status === 200 ? resFileINFO.data : {};
			setPatientInfo({
				AccessionNumber: accessionNumber,
				PatientName: patientName,
				PatientSex: patientSex,
				Modality: modality,
				PatientAge: patientAge,
				PatientID: patientId,
				StudyDate: studyDate
			});

			const filePaths = [];
			//添加文件id
			for (let i = 1; i <= files.length; i++) {
				filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i));
			}
			sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
			setIsUploadFile(true);
		} else {
			message.error('上传失败');
		}
	}

	async function setAnnotationInLocal() {
		const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
		const nowToolState = toolStateManager.toolState;
		setAnnotation(nowToolState);
	}

	async function saveAnnotation() {
		if (seriesInstanceUID !== '') {
			console.log('annotation', annotation)
			// const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
			// const nowToolState = toolStateManager.toolState;
			if (JSON.stringify(annotation) === '{}') {
				return message.info('当前没有批注');
			}
			console.log('saving annotation', annotation);
			const label = JSON.stringify(annotation);
			const res = await saveAnnotationFun(seriesInstanceUID, label);
			if (res.status === 200) {
				message.success('成功保存标记');
			} else {
				message.info('未知错误');
			}
		}
	}

	// 清楚所有标注
	function clearAllAnnotations() {
		if (imgRef.current) {
			const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
			const toolState = toolStateManager.toolState;
			for (const imageId in toolState) {
				toolStateManager.clearImageIdToolState(imageId)
			}
			// 刷新图像
			cornerstone.updateImage(imgRef.current);

		}
	}

	// 还原标注
	async function restoreData(seriesInstanceUID) {
		if (imgRef.current && seriesInstanceUID !== '') {
			const res = await getAnnotation(seriesInstanceUID);
			if (res.status === 200) {
				const toolState = JSON.parse(res.data.label);
				if (JSON.stringify(toolState) === '{}') return message.info('没有要还原的标注');
				const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
				// 清除之前的标注
				clearAllAnnotations();

				for (const imageId in toolState) {
					for (const toolName in toolState[imageId]) {
						const data = [...toolState[imageId][toolName].data];
						for (const dataIndex in data) {
							const activeToolName = toolName + "Tool";
							if (!isAddTool[activeToolName]) {
								// 不能重复 addTool
								cornerstoneTools.addToolForElement(
									imgRef.current,
									cornerstoneTools[activeToolName],
									toolName === "TextMarker" ? marker() : {}
								);
								setIsAllTool(e => ({ ...e, [activeToolName]: true }));
							}

							console.log('toolStateManager.addImageIdToolState', toolStateManager.addImageIdToolState)
							toolStateManager.addImageIdToolState(imageId, toolName, data[dataIndex]);
							cornerstoneTools.setToolActiveForElement(imgRef.current, toolName, {
								mouseButtonMask: 1,
							});
							cornerstoneTools.setToolPassive(toolName);
						}
					}
				}

				setAnnotation(toolState)
				cornerstone.updateImage(imgRef.current);
				message.success('还原标注成功');
			} else if (!res.data) {
				message.info(res.msg || '信息为空');
			}
		}
	}

	const handleMouseMove = (e) => {
		const { offsetX: x, offsetY: y } = e.nativeEvent;
		setPosition({ x, y, });
		if (imgRef.current && isUploadFile) {
			setViewPort((viewPort) => ({
				...viewPort,
				...cornerstone.getViewport(imgRef.current),
			}));
		}
	};

	const handleWheel = () => {
		if (imgRef.current && isUploadFile) {
			setViewPort((viewPort) => ({
				...viewPort,
				...cornerstone.getViewport(imgRef.current),
			}));
		}
	};

	//负责导出文件
	const handleExport = () => {
		if (Object.getOwnPropertyNames(details).length == 0) {
			return;
		}
		let title = [
			"PatientID",
			"PatientName",
			"SeriesInstanceUID",
			"Modality",
			"PatientAddress",
			"PatientAge",
			"StudyDate",
			"Label",
			"AnnotationType",
			"Length",
			"Points",
		];
		//填充基本信息和类型
		let str = [];
		str.push(title.join(",") + "\r\n");
		for (let i = 0; i < details.length; i++) {
			let arr = new Array(title.length).fill("");
			for (let j = 0; j < title.length; j++) {
				if (title[j] in patientInfo) {
					arr[j] = patientInfo[title[j]];
				} else if (title[j] == "AnnotationType") {
					arr[j] = details[i].toolName;
				} else if (title[j] == "Label") {
					arr[j] = details[i].tagName;
				} else if (title[j] == "Length") {
					arr[j] = details[i].length;
				} else if (title[j] == "Points") {
					let reg = new RegExp('"', "g");
					let points = JSON.stringify(details[i].handles);
					arr[j] = points.replace(reg, '""');
					arr[j] = '"' + arr[j] + '"';
				}
			}
			str.push(arr.join(",") + "\r\n");
		}
		const blob = new Blob(["\uFEFF" + str.join("")], {
			type: "test/csv;charset=utf-8",
		});
		//导出
		const url = window.URL.createObjectURL(blob);
		const downloadLink = document.createElement("a");
		downloadLink.href = url;
		//导出文件的文件名
		downloadLink.download = patientInfo.PatientID + ".csv";
		downloadLink.click();
		window.URL.revokeObjectURL(url);
	};
	//导出文件具体方法

	const { AccessionNumber, Modality, PatientAddress, PatientAge, PatientID, PatientName, StudyDate } = patientInfo;
	return (
		<div className="Part1">
			<MessageCom
				currentCount={count}
				totalCount={totalCount}
				isShow={isShowMessage}
				isUploadFile={isUploadOrGetImage}
			/>
			<Header />
			<div className="toolBar">
				<BasicFunBtn title='滚动切片' iconCode='&#xe6f6;' onClick={chooseTool("StackScrollMouseWheel")} />
				<BasicFunBtn title='窗宽/窗位' iconCode='&#xe635;' onClick={chooseTool("Wwwc")} />
				<BasicFunBtn title='缩放' iconCode='&#xe7ca;' onClick={chooseTool("ZoomMouseWheel")} />
				<BasicFunBtn title='放大镜' iconCode='&#xe662;' onClick={chooseTool("Magnify")} />
				<BasicFunBtn title='移动' iconCode='&#xeb70;' onClick={chooseTool("Pan")} />
				<BasicFunBtn title='角度测量' iconCode='&#xe631;' onClick={chooseTool("Angle")} />
				<BasicFunBtn title='长度测量' iconCode='&#xedda;' onClick={chooseTool("Length")} />
				<BasicFunBtn title='橡皮擦' iconCode='&#xe606;' onClick={chooseTool("Eraser")} />
				<BasicFunBtn title='圆形标注' iconCode='&#xe61b;' onClick={chooseTool("CircleRoi")} />
				<BasicFunBtn title='矩形标注' iconCode='&#xe604;' onClick={chooseTool("RectangleRoi")} />
				<BasicFunBtn title='自由标注' iconCode='&#xe6ec;' onClick={chooseTool("FreehandRoi")} />
				<BasicFunBtn title='画笔工具' iconCode='&#xe670;' onClick={chooseTool("Brush")} />

				<button className="uploadTool" onClick={uploadFiles}>
					<div className="txt">上传影像</div>
					<input
						type="file"
						onChange={loadFiles}
						style={{ display: "none" }}
						webkitdirectory="true"
						ref={fileRef}
					/>
				</button>
				<button className="saveTool" onClick={() => saveAnnotation()}>
					<div className="txt">保存标注</div>
				</button>
				<button className="rev" onClick={() => { restoreData(seriesInstanceUID) }}>还原标注</button>
			</div>

			<div className="p-detail">
				<div className="p-picList">
					<div className="showPic" ref={leftDom}>
						{allImageId.map((item, index) => {
							return <Item key={index} data={item} curIndex={curIndex} ele={imgRef.current}></Item>
						})}
					</div>
				</div>

				<div
					className="detailPicBox"
					onMouseMove={(e) => handleMouseMove(e)}
					onWheel={handleWheel}
				>
					<div className="detailPic" ref={imgRef}></div>

					{isUploadFile ? (
						<div className="position">
							<span>{curIndex + 1}/{allImageId.length}</span>
							<br />
							<span>X:{position.x}</span>
							&nbsp;
							<span>Y:{position.y}</span>
						</div>
					) : null}

					{isUploadFile ? (
						<div className="viewPort">
							<div>Zoom:{Math.floor(viewPort.scale * 100)}%</div>
							<div>
								{" "}
								WW/WL:
								<span>
									{Math.floor(viewPort.voi.windowWidth)}/
									{Math.floor(viewPort.voi.windowCenter)}
								</span>
							</div>
						</div>
					) : null}

					{isUploadFile ? (
						<div className="PatientInfo">
							<p>
								Patient Name :{" "}
								{PatientName ? PatientName : '未知'}
							</p>
							<p>
								Patient ID :{" "}
								{PatientID ? PatientID : '未知'}
							</p>
							<p>
								Patinet Age :{" "}
								{PatientAge ? PatientAge : '未知'}
							</p>
							<p>
								Patinet Address :{" "}
								{PatientAddress ? PatientAddress : '未知'}
							</p>
						</div>
					) : null}
					{isUploadFile ? (
						<div className="study">
							<p>
								Modality :{" "}
								{Modality ? Modality : '未知'}
							</p>
							<p>
								Study Date :{" "}
								{StudyDate ? StudyDate : '未知'}
							</p>
							<p>
								Accession Number :{" "}
								{AccessionNumber ? AccessionNumber : '未知'}
							</p>
						</div>
					) : null}
				</div>

				<div className="picTag">
					<div>
						<div className="tagTitles">
							<div className="tag0"></div>
							<div className="tag1">序号</div>
							<div className="tag2">标签名</div>
							<div className="tag3">测量值</div>
							{/* <div className="tag4">平均CT值</div> */}
						</div>
						<div className="tagDetails">
							<DetailContainer
								toolState={annotation}
								setAnnotation={setAnnotation}
								element={imgRef.current}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
