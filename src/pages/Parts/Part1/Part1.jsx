import React, { useState, useRef, useEffect } from "react";
import {
	cornerstone,
	dicomParser,
	cornerstoneWADOImageLoader,
	cornerstoneTools,
} from "../../../util/js/cornerstone";

import {
	uploadFile,
	// getInstanceNumbers,
	// getDicomFile,
	getFileInfo,
} from "../../../util/api/httpUtil";

import myStore from "../../../util/store/store";
import {
	addLabeltoState,
	setLabelName,
	deleteLabeltoState,
} from "../../../util/store/store";
import Header from "../Header/Header";
import Item from "./Item/Item";
import Detail from "./Detail/Detail";
import "./Part1.scss";
import { message } from "antd";
import { BasicFunBtn } from "../../../components";
import axios from "axios";

const mouseToolChain = [
	{
		name: "StackScrollMouseWheel",
		func: cornerstoneTools.StackScrollMouseWheelTool,
		config: {},
	},
	{ name: "Wwwc", func: cornerstoneTools.WwwcTool, config: {} },
	{
		name: "ZoomMouseWheel",
		func: cornerstoneTools.ZoomMouseWheelTool,
		config: {},
	},
	{ name: "Pan", func: cornerstoneTools.PanTool, config: {} },
	{ name: "Magnify", func: cornerstoneTools.MagnifyTool, config: {} },
	{ name: "Angle", func: cornerstoneTools.AngleTool, config: {} },
	{ name: "Length", func: cornerstoneTools.LengthTool, config: {} },
	{ name: "Eraser", func: cornerstoneTools.EraserTool, config: {} },
	{
		name: "CircleScissors",
		func: cornerstoneTools.CircleScissorsTool,
		config: {},
	},
	{
		name: "RectangleScissors",
		func: cornerstoneTools.RectangleScissorsTool,
		config: {},
	},
	{
		name: "FreehandScissors",
		func: cornerstoneTools.FreehandScissorsTool,
		config: {},
	},
	{ name: "Brush", func: cornerstoneTools.BrushTool },
];

const toolState = {};

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
	const picRef = useRef(null);
	const [viewPort, setViewPort] = useState({});
	// 位置信息
	const [position, setPosition] = useState({ x: 0, y: 0 });
	// 四个角显示的信息
	const [patientInfo, setPatientInfo] = useState({ name: '', id: '', age: '', address: '', modality: '', studyDate: '', accessionNum: 0 });
	// 是否上传了文件
	const [isUploadFile, setIsUploadFile] = useState(false);
	// 看意思是存储右侧信息
	const [details, setDetails] = useState([]);

	const [data, setData] = useState([]);
	const [result, setResult] = useState();
	const [fileImgId, setFileImgId] = useState('');
	const [obj, setObj] = useState({});

	useEffect(() => {
		cornerstone.enable(imgRef.current);

		setDetails(myStore.getState().labelDetails);

		myStore.subscribe(() => {
			let newLableDetails = myStore.getState().labelDetails;
			setDetails([...newLableDetails]);
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
						let detailString = JSON.stringify(detail);
						myStore.dispatch(addLabeltoState(detailString));
					}, 100);
				}
			}
		);

		setViewPort((viewPort) => ({
			...viewPort,
			voi: { windowWidth: "", windowCenter: "" },
			scale: 0,
		}));
	}, []);

	// useEffect(() => {
	//   console.log(details);
	// }, [details])

	let getImageId = (seriesInstanceUID, instanceNumber) => {
		return (
			"wadouri:" +
			"http://8.130.137.118:8080/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?" +
			`seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`
		);
	};

	// useEffect(() => {
	// 	cornerstone.enable(imgRef.current);
	// 	const StackScrollMouseWheelTool =
	// 		cornerstoneTools.StackScrollMouseWheelTool;
	// 	cornerstoneTools.addTool(StackScrollMouseWheelTool);
	// 	cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
	// 	if (location.state) {
	// 		getPatientDicom(location.state.record);
	// 	}
	// }, []);

	useEffect(() => {
		let path = JSON.parse(sessionStorage.getItem("FILE_PATH")) || null;
		if (path && isUploadFile) {
			let imageIds = path;
			let stack = {
				currentImageIdIndex: 0,
				imageIds,
			};
			cornerstone.loadAndCacheImage(imageIds[0]).then((img) => {
				cornerstone.displayImage(imgRef.current, img);
				cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
				cornerstoneTools.addToolState(imgRef.current, "stack", stack);
			});
			setPatientInfo(JSON.parse(sessionStorage.getItem("PATIENT_INFO")));
			setData(JSON.parse(sessionStorage.getItem("FILE_PATH")));
		}
	}, [isUploadFile]);

	function chooseTool(name) {
		return () => {
			//修改前
			// for (let i = 0; i < mouseToolChain.length; i++) {
			//   if (mouseToolChain[i].name === name) {
			//     cornerstoneTools.addToolForElement(
			//       imgRef.current,
			//       mouseToolChain[i].func
			//     );
			//     cornerstoneTools.setToolActiveForElement(
			//       imgRef.current,
			//       mouseToolChain[i].name, {
			//       mouseButtonMask: 1,
			//     });
			//   } else {
			//     cornerstoneTools.addToolForElement(
			//       imgRef.current,
			//       mouseToolChain[i].func
			//     );
			//     cornerstoneTools.setToolPassiveForElement(
			//       imgRef.current,
			//       mouseToolChain[i].name, {
			//       mouseButtonMask: 1,
			//     });
			//   }
			// }

			//新
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
			if (!toolState[activeToolName]) {
				// 不能重复 addTool
				cornerstoneTools.addToolForElement(
					imgRef.current,
					cornerstoneTools[activeToolName],
					tool === "TextMarker" ? marker() : {}
				);
				toolState[activeToolName] = true;
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

	// async function loadFiles(e) {
	// 	message.loading('上传中...');
	// 	const files = e.target.files;
	// 	console.log('files', files)
	// 	const formdata = new FormData();
	// 	const demoData = new FormData();
	// 	const imageIds = [];
	// 	for (let i = 1; i < files.length; i++) {
	// 		formdata.append("file", files[i - 1]);
	// 		const file = files[i];
	// 		const read = new FileReader();
	// 		imageIds[i - 1] = "";
	// 		read.readAsArrayBuffer(file);
	// 		read.onload = function () {
	// 			const resu = dicomParser.parseDicom(new Uint8Array(this.result));
	// 			const url = "http://" + file.name;
	// 			const fileImgId = "wadouri:" + url;
	// 			setResult(resu);
	// 			setFileImgId(fileImgId);
	// 			imageIds[i - 1] = fileImgId;
	// 			//设置映射关系
	// 			cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.add(url, resu);
	// 			cornerstone.imageCache.putImageLoadObject(
	// 				fileImgId,
	// 				cornerstoneWADOImageLoader.wadouri.loadImageFromPromise(
	// 					new Promise((res) => {
	// 						res(resu);
	// 					}),
	// 					fileImgId
	// 				)
	// 			);
	// 			const stack = {
	// 				currentImageIdIndex: 0,
	// 				imageIds,
	// 			};
	// 			//加载dcm文件并缓存
	// 			cornerstone.loadAndCacheImage(imageIds[0]).then((img) => {
	// 				cornerstone.displayImage(imgRef.current, img);
	// 				cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
	// 				cornerstoneTools.addToolState(imgRef.current, "stack", stack);
	// 			});
	// 		};
	// 	}
	// 	demoData.append("file", files[0]);
	// 	// console.log(formdata.getAll("file"));
	// 	uploadFile(formdata);

	// 	let fileInfo = await getFileInfo(demoData);
	// 	//此处
	// 	let patientInfo = { ...fileInfo.data };
	// 	//添加文件id
	// 	let filePaths = [];
	// 	for (let i = 1; i <= files.length; i++) {
	// 		filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i));
	// 	}
	// 	sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
	// 	sessionStorage.setItem("PATIENT_INFO", JSON.stringify(patientInfo));
	// 	setIsUploadFile(true);
	// 	setData(filePaths);
	// }

	async function loadFiles(e) {
		message.loading('上传中');
		let files = e.target.files;
		let formdata = new FormData();
		let demoData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formdata.append("file", files[i]);
		}
		demoData.append("file", files[0]);
		// console.log(formdata.getAll("file"));
		uploadFile(formdata);
		// const res = await axios.post('http://127.0.0.1:4523/m1/3019322-0-default/file/uploadDicomFile', formdata, {
		// 	headers: {
		// 		"Content-Type": "multipart/form-data"
		// 	}
		// });
		// console.log('res', res)

		let fileInfo = await getFileInfo(demoData);
		//此处
		let patientInfo = { ...fileInfo.data };
		const filePaths = ["wadouri:http://8.130.137.118:8080/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?seriesInstanceUID=1.3.6.1.4.1.14519.5.2.1.6279.6001.323541312620128092852212458228&instanceNumber=1"];
		//添加文件id
		// for (let i = 1; i <= files.length; i++) {
		// 	filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i));
		// }
		sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
		sessionStorage.setItem("PATIENT_INFO", JSON.stringify(patientInfo));
		setIsUploadFile(true);
		setData(filePaths);
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

	const { name, id, age, address, modality, studyDate, accessionNum } = patientInfo;
	return (
		<div className="Part1">
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
				<button className="saveTool" onClick={() => handleExport()}>
					<div className="txt">保存标注</div>
				</button>
				<button className="rev">还原标注</button>
			</div>

			<div className="p-detail">
				<div className="p-picList">
					<div className="showPic">
						{/* {data.map((item, index) => {
              return <Item key={index} data={item}></Item>
            })}
						<div className="pic" ref={picRef}></div>; */}
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
								{name}
							</p>
							<p>
								Patient ID :{" "}
								{id}
							</p>
							<p>
								Patinet Age :{" "}
								{age}
							</p>
							<p>
								Patinet Address :{" "}
								{address}
							</p>
						</div>
					) : null}
					{isUploadFile ? (
						<div className="study">
							<p>
								Modality :{" "}
								{modality}
							</p>
							<p>
								Study Date :{" "}
								{studyDate}
							</p>
							<p>
								Accession Number :{" "}
								{accessionNum}
							</p>
						</div>
					) : null}
				</div>

				<div className="picTag">
					<div>
						<div className="tagTitles">
							<div className="tag0"></div>
							<div className="tag1">序号</div>
							<div className="tag2">工具类型</div>
							<div className="tag3">测量值</div>
							{/* <div className="tag4">平均CT值</div> */}
						</div>
						<div className="tagDetails">
							{details.map((detail, index) => {
								return (
									<Detail detail={detail} index={index} key={detail.uuid} />
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
