import React, { useState, useRef, useEffect } from "react";
import {
	cornerstone,
	dicomParser,
	cornerstoneWADOImageLoader,
	cornerstoneTools,
} from "../../../util/js/cornerstone";
import extend from "../../../util/js/extend";
import Item from "./Item/Item";
import getImagePixelModule from "../../../util/js/getImagePixelModule";
import metaDataProvider from "../../../util/js/meteDataProvider";
import "./Part2.scss";
import {
	uploadFile,
	getDicomFileByPatientId_StudyDate_SeriesInstanceUID,
	getFileInfo,
} from "../../../util/api/httpUtil";
import Header from "../Header/Header";
import { useLocation } from "react-router-dom";
import "./Part2Test.scss";

// 添加对应的工具信息
const mouseToolChain = [
	{ name: "Wwwc", func: cornerstoneTools.WwwcTool, config: {} },
	{
		name: "Rotate",
		func: cornerstoneTools.RotateTool,
		config: {},
	},
	{
		name: "FreehandScissors",
		func: cornerstoneTools.FreehandScissorsTool,
		config: {},
	},
	{
		name: "ZoomMouseWheel",
		func: cornerstoneTools.ZoomMouseWheelTool,
		config: {},
	},
	{ name: "xxx", func: cornerstoneTools.clipBoxToDisplayedArea, config: {} },
];

const toolState = {};

let activeToolName = ""; // 激活工具名称
let prevToolName = ""; // 上一个激活工具名称

export function Part2Test() {
	const [ids, setIds] = useState([]);
	const [isShow, setIsShow] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [patientInfo, setPatientInfo] = useState({});
	const [viewPort, setViewPort] = useState({
		voi: { windowWidth: "", windowCenter: "" },
		scale: 0,
	});

	const fileRef = useRef(null);
	const imgRef = useRef(null);
	const location = useLocation();

	let upTb = false;
	let upLr = false;
	let result = undefined; // 存储当前选中的 DCM文件解析后的 DataSet 对象
	let fileImgId = ""; // 当前选中的 DCM文件 imageId
	let imageIds = [];

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

	//   上下左右翻转图片
	function upsideDownTb() {
		upTb = !upTb;
		cornerstone.setViewport(imgRef.current, {
			vflip: upTb,
		});
	}
	function upsideDownLr() {
		upLr = !upLr;
		cornerstone.setViewport(imgRef.current, {
			hflip: upLr,
		});
	}
	//图片降噪
	function denoiseImage() {
		if (!cv) return;

		const imgCanvas = document.getElementsByClassName("cornerstone-canvas")[0];
		//获取图片数据
		const matImage = cv.imread(imgCanvas);
		// 使用OpenCV进行高斯滤波
		const ksize = new cv.Size(5, 5); // 高斯核大小
		const sigmaX = 0; // X方向上的高斯核标准差
		const sigmaY = 0; // Y方向上的高斯核标准差
		cv.GaussianBlur(
			matImage,
			matImage,
			ksize,
			sigmaX,
			sigmaY,
			cv.BORDER_DEFAULT
		);
		// 展示处理后的图片
		const ctx = imgCanvas.getContext("2d");
		const outputImageData = new ImageData(
			new Uint8ClampedArray(matImage.data),
			matImage.cols,
			matImage.rows
		);
		ctx.putImageData(outputImageData, 0, 0);
	}

	cornerstone.metaData.addProvider(function (type, imageId) {
		if (type == "imagePixelModule" && imageId == fileImgId) {
			return getImagePixelModule(result);
		}
		return metaDataProvider(type, imageId);
	});

	//   上传图片
	function uploadFiles() {
		fileRef.current.click();
	}
	//   加载图片
	async function loadFiles(e) {
		let files = e.target.files;
		if (!files || !files.length) return;
		const formdata = new FormData();
		const demoData = new FormData();
		demoData.append("file", files[0]);
		imageIds = [];
		for (let i = 1; i < files.length; i++) {
			formdata.append("file", files[i - 1]);
			let file = files[i];
			imageIds[i - 1] = "";
			let read = new FileReader();
			read.readAsArrayBuffer(file);
			read.onload = function () {
				result = dicomParser.parseDicom(new Uint8Array(this.result));
				/* let url = "http://" + file.name;
				fileImgId = "wadouri:" + url; */
				fileImgId = "dicomfile:" + file.name;
				let url = fileImgId;
				imageIds[i - 1] = fileImgId;
				//设置映射关系
				cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.add(url, result);
				cornerstone.imageCache.putImageLoadObject(
					fileImgId,
					cornerstoneWADOImageLoader.wadouri.loadImageFromPromise(
						new Promise((res) => {
							res(result);
						}),
						fileImgId
					)
				);
				const stack = {
					currentImageIdIndex: 0,
					imageIds,
				};
				//加载dcm文件并缓存
				cornerstone.loadAndCacheImage(imageIds[0]).then((img) => {
					cornerstone.displayImage(imgRef.current, img);
					cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
					cornerstoneTools.addToolState(imgRef.current, "stack", stack);
				});
			};
		}
		//uploadFile(formdata);
		setIsShow(true);
		let fileInfo = await getFileInfo(demoData);
		let patientInfo = { ...fileInfo.data };
		//添加文件id
		let filePaths = [];
		for (let i = 1; i <= files.length; i++) {
			filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i));
		}
		sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
		sessionStorage.setItem("PATIENT_INFO", JSON.stringify(patientInfo));
	}

	//鼠标位置定位
	const handleMouseMove = (e) => {
		setPosition({
			x: e.nativeEvent.offsetX,
			y: e.nativeEvent.offsetY,
		});
		if (imgRef.current && isShow) {
			setViewPort((viewPort) => ({
				...viewPort,
				...cornerstone.getViewport(imgRef.current),
			}));
		}
	};

	// 下载文件
	function downLoad() {
		const dcmData = cornerstone.getEnabledElement(imgRef.current);
		// 判断dcm文件是否存在
		if (!dcmData.image) return;
		//获取文件名
		const dcmName = dcmData.image.imageId;
		const match = dcmName.match(/(?<=wadouri:http:\/\/)\d-\d{3}/);
		const newName = match ? match[0] : 'filename';
		const dcmCanvas = document.getElementsByClassName("cornerstone-canvas")[0];
		const a = document.createElement("a");
		a.href = dcmCanvas.toDataURL("image/png");
		a.download = newName + ".png";
		a.click();
	}

	const getImageId = (seriesInstanceUID, instanceNumber) => {
		return (
			"wadouri:" +
			"http://8.130.137.118:8080/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?" +
			`seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`
		);
	};
	//获取患者信息

	useEffect(() => {
		let path = JSON.parse(sessionStorage.getItem("FILE_PATH")) || null;
		if (path && isShow) {
			//从SessionStorage中获取信息
			setPatientInfo(JSON.parse(sessionStorage.getItem("PATIENT_INFO")));
		}
	}, [isShow]);

	//获取患者对应的dicom
	const getPatientDicom = (record) => {
		const { patientId, seriesInstanceUID, studyDate } = record;
		getDicomFileByPatientId_StudyDate_SeriesInstanceUID(
			patientId,
			seriesInstanceUID,
			studyDate
		).then(
			(res) => {
				console.log(res);
			},
			(err) => {
				console.log(err);
			}
		);
	};

	useEffect(() => {
		cornerstone.enable(imgRef.current);
		const StackScrollMouseWheelTool =
			cornerstoneTools.StackScrollMouseWheelTool;
		cornerstoneTools.addTool(StackScrollMouseWheelTool);
		cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
		extend();
		if (location.state) {
			getPatientDicom(location.state.record);
		}
	}, []);
	//图像剪裁
	const clip = () => {
		const clipAreaWrap = useRef(null); // 截图区域dom
		const clipCanvas = useRef(null); // 用于截图的的canvas，以及截图开始生成截图效果（背景置灰）
		const drawCanvas = document.getElementsByClassName("cornerstone-canvas")[0];
		const [clipImgData, setClipImgData] = useState("");
		const init = (wrap) => {
			if (!wrap) return;
			clipAreaWrap.current = wrap;
			clipCanvas.current = document.createElement("canvas");
			clipCanvas.current.style =
				"width:100%;height:100%;z-index: 2;position: absolute;left: 0;top: 0;";
			clipAreaWrap.current.appendChild(clipCanvas.current);
			clipAreaWrap.current.appendChild(drawCanvas);
		};
		// 截图
		const cut = () => {
			const drawCanvasCtx = drawCanvas.getContext("2d");
			const clipCanvasCtx = clipCanvas.current.getContext("2d");

			const wrapWidth = clipAreaWrap.current.clientWidth;
			const wrapHeight = clipAreaWrap.current.clientHeight;
			clipCanvas.current.width = wrapWidth;
			clipCanvas.current.height = wrapHeight;

			// 设置截图时灰色背景
			clipCanvasCtx.fillStyle = "rgba(0,0,0,0.6)";
			clipCanvasCtx.strokeStyle = "rgba(0,143,255,1)";

			// 生成一个截取区域的img 然后把它作为canvas的第一个参数
			const clipImg = document.createElement("img");
			clipImg.classList.add("img_anonymous");
			clipImg.crossOrigin = "anonymous";

			// 那其实画的是原始大小的clipImg
			//clipAreaWrap.current.appendChild(clipImg);

			// 绘制截图区域
			clipImg.onload = () => {
				// x,y -> 计算从drawCanvasCtx的的哪一x,y坐标点进行绘制
				const x = Math.floor((wrapWidth - clipImg.width) / 2);
				const y = Math.floor((wrapHeight - clipImg.height) / 2);
				// 用这个宽高在drawCanvasCtx的绘图只会绘制clipImg的小部分内容（因为假宽高比真宽高小），看起来就像是被放大了
				const clipImgCopy = clipImg.cloneNode();
				drawCanvasCtx.drawImage(
					clipImg,
					0,
					0,
					clipImgCopy.width,
					clipImgCopy.height,
					x,
					y,
					clipImg.width,
					clipImg.height
				);
			};

			let start = null;

			// 获取截图开始的点
			clipCanvas.current.onmousedown = function (e) {
				start = {
					x: e.offsetX,
					y: e.offsetY,
				};
			};

			// 绘制截图区域效果
			clipCanvas.current.onmousemove = function (e) {
				if (start) {
					fill(
						clipCanvasCtx,
						wrapWidth,
						wrapHeight,
						start.x,
						start.y,
						e.offsetX - start.x,
						e.offsetY - start.y
					);
				}
			};

			// 截图完毕，获取截图图片数据
			document.addEventListener("mouseup", function (e) {
				if (start) {
					var url = getClipPicUrl(
						{
							x: start.x,
							y: start.y,
							w: e.offsetX - start.x,
							h: e.offsetY - start.y,
						},
						drawCanvasCtx
					);
					start = null;
					//生成base64格式的url
					setClipImgData(url);
					cancelCut();
					downloadBase64(url, "clipped");
				}
			});
		};

		const cancelCut = () => {
			clipCanvas.current.width = clipAreaWrap.current.clientWidth;
			clipCanvas.current.height = clipAreaWrap.current.clientHeight;
			const clipCanvasCtx = clipCanvas.current.getContext("2d");
			clipCanvasCtx.clearRect(
				0,
				0,
				clipCanvas.current.clientWidth,
				clipCanvas.current.clientHeight
			);
			//移除鼠标事件
			clipCanvas.current.onmousedown = null;
			clipCanvas.current.onmousemove = null;
			//移除临时截图创建的canvas
			imgRef.current.children[0].remove();
		};

		const getClipPicUrl = (area, drawCanvasCtx) => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			const data = drawCanvasCtx.getImageData(area.x, area.y, area.w, area.h);
			canvas.width = area.w;
			canvas.height = area.h;
			context.putImageData(data, 0, 0);
			return canvas.toDataURL("image/png", 1);
		};

		//base64格式下载png
		function downloadBase64(content, fileName) {
			var base64ToBlob = function (code) {
				let parts = code.split(";base64,");
				let contentType = parts[0].split(":")[1];
				let raw = window.atob(parts[1]);
				let rawLength = raw.length;
				let uInt8Array = new Uint8Array(rawLength);
				for (let i = 0; i < rawLength; ++i) {
					uInt8Array[i] = raw.charCodeAt(i);
				}
				return new Blob([uInt8Array], {
					type: contentType,
				});
			};
			let aLink = document.createElement("a");
			let blob = base64ToBlob(content); //new Blob([content]);
			aLink.download = fileName + ".png";
			aLink.href = URL.createObjectURL(blob);
			aLink.click();
			aLink.remove();
		}

		// 绘制出截图的效果
		const fill = (context, ctxWidth, ctxHeight, x, y, w, h) => {
			context.clearRect(0, 0, ctxWidth, ctxHeight);
			context.beginPath();
			//遮罩层
			context.globalCompositeOperation = "source-over";
			context.fillRect(0, 0, ctxWidth, ctxHeight);
			//画框
			context.globalCompositeOperation = "destination-out";
			context.fillRect(x, y, w, h);
			//描边
			context.globalCompositeOperation = "source-over";
			context.moveTo(x, y);
			context.lineTo(x + w, y);
			context.lineTo(x + w, y + h);
			context.lineTo(x, y + h);
			context.lineTo(x, y);
			// context.stroke()
			context.closePath();
		};
		return { init, cut };
	};

	const { init, cut } = clip();
	return (
		<div className="Part2Test">
			<Header />
			<div className="toolBar">
				<div className="left">
					<button
						className="singleTool"
						onClick={chooseTool("StackScrollMouseWheel")}
					>
						<span className="iconfont toolIcons">&#xe6f6;</span>
						<div className="txt">滚动切片</div>
					</button>

					<button className="singleTool" onClick={chooseTool("Wwwc")}>
						<span className="iconfont toolIcons">&#xe635;</span>
						<div className="txt">图像加强</div>
					</button>

					<button className="singleTool" onClick={denoiseImage}>
						<span className="iconfont toolIcons">&#xe7ca;</span>
						<div className="txt">图像去噪</div>
					</button>

					<button className="singleTool" onClick={upsideDownTb}>
						<span className="iconfont toolIcons">&#xe662;</span>
						<div className="txt">上下翻转</div>
					</button>

					<button className="singleTool" onClick={upsideDownLr}>
						<span className="iconfont toolIcons">&#xeb70;</span>
						<div className="txt">左右翻转</div>
					</button>

					<button
						className="singleTool"
						onClick={chooseTool("ZoomMouseWheel")}
					>
						<span className="iconfont toolIcons">&#xe631;</span>
						<div className="txt">图像缩放</div>
					</button>
					<button
						className="singleTool"
						onClick={() => {
							if (prevToolName) {
								cornerstoneTools.setToolPassiveForElement(
									imgRef.current,
									prevToolName,
									{
										mouseButtonMask: 1,
									}
								); // 把上一个激活工具冻结
							}
							init(imgRef.current);
							cut();
						}}
					>
						<span
							className="iconfont to
          olIcons"
						>
							&#xe631;
						</span>
						<div className="txt">图像剪裁</div>
					</button>
				</div>
				<div className="right">
					<button className="uploadTool" onClick={uploadFiles}>
						<div className="txt">上传</div>
						<input
							type="file"
							onChange={loadFiles}
							style={{ display: "none" }}
							webkitdirectory="true"
							ref={fileRef}
						/>
					</button>
					<button className="uploadTool" onClick={downLoad}>
						<div className="txt">下载</div>
					</button>
				</div>
			</div>

			{/* 下面展示图片 */}
			<div className="p-detail">
				{/* 截图区域 */}
				{/* <div className="clip-img-area">
					<img src={clipImgData} alt="" id="img" />
				</div> */}

				<div className="p-picList">
					<div className="showPic">
						{/* ids.map((item, index) => {
							return <div key={index}></div>;
						}) */}
					</div>
				</div>

				<div className="detailPicBox" onMouseMove={(e) => handleMouseMove(e)}>
					<div
						className="detailPic"
						id="test"
						onContextMenu={() => false}
						onMouseDown={() => false}
						ref={imgRef}
					></div>

					{isShow ? (
						<div className="position">
							<span>X:{position.x}</span>
							&nbsp;
							<span>Y:{position.y}</span>
						</div>
					) : null}

					{isShow ? (
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

					{isShow ? (
						<div className="PatientInfo">
							<p>
								Patient Name :{" "}
								{patientInfo.PatientName
									? patientInfo.PatientName
									: "undefined"}
							</p>
							<p>
								Patient ID :{" "}
								{patientInfo.PatientID ? patientInfo.PatientID : "undefined"}
							</p>
							<p>
								Patinet Age :{" "}
								{patientInfo.PatientAge ? patientInfo.PatientAge : "undefined"}
							</p>
							<p>
								Patinet Address :{" "}
								{patientInfo.PatientAddress
									? patientInfo.PatientAddress
									: "undefined"}
							</p>
						</div>
					) : null}

					{isShow ? (
						<div className="study">
							<p>
								Modality :{" "}
								{patientInfo.Modality ? patientInfo.Modality : "undefined"}
							</p>
							<p>
								Study Date :{" "}
								{patientInfo.StudyDate ? patientInfo.StudyDate : "undefined"}
							</p>
							<p>
								Accession Number :{" "}
								{patientInfo.AccessionNumber
									? patientInfo.AccessionNumber
									: "undefined"}
							</p>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
