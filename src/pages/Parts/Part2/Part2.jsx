import React, { useState, useRef, useEffect } from "react";
import Item from "./Item/Item";
import { cornerstone, cornerstoneTools } from "../../../util/js/cornerstone";

import { uploadFile, getFileInfo } from "../../../util/api/httpUtil";

import Header from "./Header/Header";
import "./Part2.scss";

// 设置工具按钮对应功能
const mouseToolChain = [
  {
    name: "StackScrollMouseWheel",
    func: cornerstoneTools.StackScrollMouseWheelTool,
    config: {},
  },
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

export function Part2() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  // const picRef = useRef(null);
  let [viewPort, setViewPort] = useState({});
  const [patientInfo, setPatientInfo] = useState({});
  const [isShow, setIsShow] = useState(false);
  let [data, setData] = useState([]);
  // 用于控制图像上下翻转
  let upTb = false;
  let upLr = false;

  useEffect(() => {
    cornerstone.enable(imgRef.current);
    // cornerstone.enable(picRef.current);

    setViewPort((viewPort) => ({
      ...viewPort,
      voi: { windowWidth: "", windowCenter: "" },
      scale: 0,
    }));
  }, []);

  // 设置请求dcm文件的id
  let getImageId = (seriesInstanceUID, instanceNumber) => {
    return (
      "wadouri:" +
      "http://43.142.168.114:8001/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?" +
      `seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`
    );
  };

  useEffect(() => {
    let path = JSON.parse(sessionStorage.getItem("FILE_PATH")) || null;
    if (path) {
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
      setIsShow(true);
      setData(JSON.parse(sessionStorage.getItem("FILE_PATH")));
    }
  }, [isShow]);

  // 工具选择
  function chooseTool(name) {
    return () => {
      for (let i = 0; i < mouseToolChain.length; i++) {
        if (mouseToolChain[i].name === name) {
          cornerstoneTools.addTool(mouseToolChain[i].func);
          cornerstoneTools.setToolActive(mouseToolChain[i].name, {
            mouseButtonMask: 1,
          });
        } else {
          cornerstoneTools.addTool(mouseToolChain[i].func);
          cornerstoneTools.setToolPassive(mouseToolChain[i].name, {
            mouseButtonMask: 1,
          });
        }
      }
    };
  }

  // 上传文件
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
    console.log(formdata.getAll("file"));
    uploadFile(formdata);

    let fileInfo = await getFileInfo(demoData);
    console.log(fileInfo);
    //此处
    let patientInfo = { ...fileInfo.data };
    console.log(patientInfo);
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

  // 计算坐标值
  const handleMouseMove = (e) => {
    setPosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetX,
    });
    if (imgRef.current && isShow) {
      setViewPort((viewPort) => ({
        ...viewPort,
        ...cornerstone.getViewport(imgRef.current),
      }));
    }
  };

  // 鼠标滑动滚动文件
  const handleWheel = () => {
    if (imgRef.current && isShow) {
      setViewPort((viewPort) => ({
        ...viewPort,
        ...cornerstone.getViewport(imgRef.current),
      }));
    }
  };
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

   // 图像去噪
   function LimpidPic() {
    // 拿到当前的canvas组件
    const canvas = document.getElementsByClassName("cornerstone-canvas")[0];
    const ctx = canvas.getContext("2d");

    // 获取图片像素信息
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    // 获取一行的间隔为space，让一个像素点的数据间隔为4（是rgba颜色值）
    const space = imageData.width * 4;
    // console.log(space, "...", data.length);
    // const singleSpace = 4;
    for (let i = space; i < data.length - space; i += 4) {
      // 直接跳过边界
      if (i % space === 0 || (i + 4) % space === 0) {
        continue;
      } else {
        const singleData =
          data[i - space] +
          data[i - space + 4] +
          data[i - space - 4] +
          data[i] +
          data[i + 4] +
          data[i - 4] +
          data[i + space] +
          data[i + space + 4] +
          data[i + space - 4];
        const avg = singleData / 9;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return (
    <div className="Part1">
      <Header />
      {/* 工具栏 */}
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
          <div className="txt">图像加强</div>
        </button>

        <button className="singleTool" onClick={LimpidPic}>
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

        <button className="singleTool" onClick={chooseTool("ZoomMouseWheel")}>
          <span className="iconfont toolIcons">&#xe631;</span>
          <div className="txt">图像剪裁</div>
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
        <button className="saveTool">
          <div className="txt">保存</div>
        </button>
      </div>

      <div className="p-detail">
        {/* 旁边小列表 */}
        <div className="p-picList">
          <div className="showPic">
            {/* {data.map((item,index) => {
              return <Item key={index} data={item}></Item>
            })} */}
            {/* <div className="pic" ref={picRef}></div>; */}
          </div>
        </div>

        <div
          className="detailPicBox"
          onMouseMove={(e) => handleMouseMove(e)}
          onWheel={handleWheel}
        >
          {/* 大的图表 */}
          <div className="detailPic" ref={imgRef}></div>

          {/* 坐标值信息显示 */}
          {isShow ? (
            <div className="position">
              <span>X:{position.x}</span>
              &nbsp;
              <span>Y:{position.y}</span>
            </div>
          ) : null}
          {/* 右下信息显示 */}
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
          {/* 病人信息显示 */}
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
          {/* 切片文件信息显示 */}
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
