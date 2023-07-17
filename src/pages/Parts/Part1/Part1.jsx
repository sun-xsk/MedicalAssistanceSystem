import React, { useState, useRef, useEffect } from "react";
import {
	cornerstone,
	dicomParser,
	cornerstoneWADOImageLoader,
	cornerstoneTools,
} from "../../../util/js/cornerstone";

import mergeToolState from "../../../util/js/mergeToolState";

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

// const mouseToolChain = [
// 	{
// 		name: "StackScrollMouseWheel",
// 		func: cornerstoneTools.StackScrollMouseWheelTool,
// 		config: {},
// 	},
// 	{ name: "Wwwc", func: cornerstoneTools.WwwcTool, config: {} },
// 	{
// 		name: "ZoomMouseWheel",
// 		func: cornerstoneTools.ZoomMouseWheelTool,
// 		config: {},
// 	},
// 	{ name: "Pan", func: cornerstoneTools.PanTool, config: {} },
// 	{ name: "Magnify", func: cornerstoneTools.MagnifyTool, config: {} },
// 	{ name: "Angle", func: cornerstoneTools.AngleTool, config: {} },
// 	{ name: "Length", func: cornerstoneTools.LengthTool, config: {} },
// 	{ name: "Eraser", func: cornerstoneTools.EraserTool, config: {} },
// 	{
// 		name: "CircleScissors",
// 		func: cornerstoneTools.CircleScissorsTool,
// 		config: {},
// 	},
// 	{
// 		name: "RectangleScissors",
// 		func: cornerstoneTools.RectangleScissorsTool,
// 		config: {},
// 	},
// 	{
// 		name: "FreehandScissors",
// 		func: cornerstoneTools.FreehandScissorsTool,
// 		config: {},
// 	},
// 	{ name: "Brush", func: cornerstoneTools.BrushTool },
// ];

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
	const data = sessionStorage.getItem('preToolState');
	const preToolState = JSON.parse(data !== 'undefined' && data !== 'null' ? data : '{}');
	const [viewPort, setViewPort] = useState({});
	// 位置信息
	const [position, setPosition] = useState({ x: 0, y: 0 });
	// 四个角显示的信息
	const [patientInfo, setPatientInfo] = useState({ PatientName: '', PatientID: '', PatientAge: '', PatientAddress: '', Modality: '', StudyDate: '', AccessionNumber: 0 });
	// 是否上传了文件
	const [isUploadFile, setIsUploadFile] = useState(false);
	// 看意思是存储右侧信息
	const [details, setDetails] = useState([]);
	// 工具的加入与否
	const [isAddTool, setIsAllTool] = useState({});

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

	useEffect(() => {
		let path = JSON.parse(sessionStorage.getItem("FILE_PATH")) || null;
		if (path && isUploadFile) {
			setPatientInfo(JSON.parse(sessionStorage.getItem("PATIENT_INFO")));
		}
	}, [isUploadFile]);

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
	let imageIds = [];

	async function loadImage() {
		const image = await cornerstone.loadImage(imageIds[0]);
		cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
		const stack = {
			currentImageIdIndex: 0,
			imageIds,
		};
		// 为启用元素添加 stack 工具状态
		cornerstoneTools.addToolState(imgRef.current, "stack", stack);
		window.addEventListener('popstate', () => {
			cornerstone.reset(imgRef.current)
		})
		cornerstone.displayImage(imgRef.current, image);
	}

	async function loadFiles(e) {
		message.loading('上传中');
		let files = e.target.files;
		let formdata = new FormData();
		let demoData = new FormData();
		//本地读取文件 并且显示
		Array.from(files).forEach((file) => {
			const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
			imageIds.push(imageId);
			loadImage()
		});

		demoData.append("file", files[0]);
		//uploadFile(formdata);

		let fileInfo = await getFileInfo(demoData);
		//此处
		let patientInfo = { ...fileInfo.data };
		const filePaths = [];
		//添加文件id
		for (let i = 1; i <= files.length; i++) {
			filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i));
		}
		sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
		sessionStorage.setItem("PATIENT_INFO", JSON.stringify(patientInfo));
		setIsUploadFile(true);
		message.destroy();
		message.success('上传成功')
	}

	useEffect(() => {
		const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
		const nowToolState = toolStateManager.toolState;
		// const toolState = { ...nowToolState, ...currentToolState };
		const toolState = mergeToolState(preToolState, nowToolState);
		// const toolState = { ...toolStateManager.toolState, ...preToolState };
		sessionStorage.setItem('preToolState', JSON.stringify(toolState));
	}, [details])

	async function restoreData() {
		if (imgRef.current) {
			if (JSON.stringify(preToolState) === '{}') {
				return message.info('没有要还原的标注')
			}

			const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
			const toolState = preToolState;
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
						toolStateManager.addImageIdToolState(imageId, toolName, data[dataIndex]);
						cornerstoneTools.setToolActiveForElement(imgRef.current, toolName, {
							mouseButtonMask: 1,
						});
						cornerstoneTools.setToolPassive(toolName);
					}
				}
			}
			message.success('还原标注成功');
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
				<button className="rev" onClick={() => { restoreData() }}>还原标注</button>
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
