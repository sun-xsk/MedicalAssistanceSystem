import { cornerstoneTools, cornerstone } from "../../../util/js/cornerstone";
import Header from "../Header/Header";
import { useRef } from "react";

import './Part3.scss'

export function Part3() {

  const fileRef = useRef(null);

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

  async function loadFiles(e) {
		let files = e.target.files;
		let formdata = new FormData();
		let demoData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formdata.append("file", files[i]);
		}
		demoData.append("file", files[0]);
		// console.log(formdata.getAll("file"));
		uploadFile(formdata);

		let fileInfo = await getFileInfo(demoData);
		// console.log(fileInfo);
		//此处
		let patientInfo = { ...fileInfo.data };
		// console.log(patientInfo)
		//添加文件id
		let filePaths = [];
		for (let i = 1; i <= files.length; i++) {
			filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i));
		}
		sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
		sessionStorage.setItem("PATIENT_INFO", JSON.stringify(patientInfo));
		setIsShow(true);
		setData(filePaths);
	}

	return (
		<div className="Part3">
			<Header />
			<div className="toolBar">
				<button
					className="singleTool"
					onClick={chooseTool("StackScrollMouseWheel")}
				>
					<span className="iconfont toolIcons">&#xe6f6;</span>
					<div className="txt">滚动切片</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Wwwc")}>
					<span className="iconfont toolIcons">&#xe635;</span>
					<div className="txt">窗宽/窗位</div>
				</button>

				<button className="singleTool" onClick={chooseTool("ZoomMouseWheel")}>
					<span className="iconfont toolIcons">&#xe7ca;</span>
					<div className="txt">缩放</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Magnify")}>
					<span className="iconfont toolIcons">&#xe662;</span>
					<div className="txt">放大镜</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Pan")}>
					<span className="iconfont toolIcons">&#xeb70;</span>
					<div className="txt">移动</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Angle")}>
					<span className="iconfont toolIcons">&#xe631;</span>
					<div className="txt">角度测量</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Length")}>
					<span className="iconfont toolIcons">&#xedda;</span>
					<div className="txt">长度测量</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Eraser")}>
					<span className="iconfont toolIcons">&#xe606;</span>
					<div className="txt">橡皮擦</div>
				</button>

				<button className="singleTool" onClick={chooseTool("CircleRoi")}>
					<span className="iconfont toolIcons">&#xe61b;</span>
					<div className="txt">圆形标注</div>
				</button>

				<button className="singleTool" onClick={chooseTool("RectangleRoi")}>
					<span className="iconfont toolIcons">&#xe604;</span>
					<div className="txt">矩形标注</div>
				</button>

				<button className="singleTool" onClick={chooseTool("FreehandRoi")}>
					<span className="iconfont toolIcons">&#xe6ec;</span>
					<div className="txt">自由标注</div>
				</button>

				<button className="singleTool" onClick={chooseTool("Brush")}>
					<span className="iconfont toolIcons">&#xe670;</span>
					<div className="txt">画笔工具</div>
				</button>

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
				<button className="saveTool" onClick={() => handleExport()}>
					<div className="txt">保存</div>
				</button>
			</div>
			<div className="p-detail">
        
      </div>
		</div>
	);
}
