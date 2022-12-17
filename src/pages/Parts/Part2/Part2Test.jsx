import React, { useState, useRef, useEffect } from "react";
import {
  cornerstone,
  dicomParser,
  cornerstoneWADOImageLoader,
  cornerstoneTools,
} from "../../../util/js/cornerstone";
// import extend from "../../../util/js/extend";
// import getImagePixelModule from "../../../util/js/getImagePixelModule";
// import metaDataProvider from "../../../util/js/meteDataProvider";

import {
  getFileInfo,
  uploadFile,
  testConnect,
} from "../../../util/api/httpUtil";

import Header from "../Header/Header";
import "./Part2Test.scss";
import { btnClickExport } from "../../../util/js/downloadFile";


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

export function Part2Test() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const picRef = useRef(null);
  const [viewPort, setViewPort] = useState({
    voi: { windowWidth: "", windowCenter: "" },
    scale: 0,
  });
  const [patientInfo, setPatientInfo] = useState({});
  const [isShow, setIsShow] = useState(false);

  // 用于控制图像上下翻转
  let upTb = false;
  let upLr = false;

  let [data, setData] = useState("");
  useEffect(() => {
    cornerstone.enable(imgRef.current);
    cornerstone.enable(picRef.current);
  }, []);
  useEffect(() => {
    let path = JSON.parse(sessionStorage.getItem("FILE_PATH")) || null;
    console.log(path);
    if (path) {
      let images = path[Object.keys(path)[0]];
      //imageIds初始化及排序
      let imageIds = images.map((item) => {
        return "wadouri:" + item;
      });
      imageIds.sort((a, b) => {
        return (
          a.replace(/(.*\/)*([^.]+).*/gi, "$2") -
          b.replace(/(.*\/)*([^.]+).*/gi, "$2")
        );
      });

      let stack = {
        currentImageIdIndex: 0,
        imageIds,
      };
      cornerstone.loadAndCacheImage(imageIds[0]).then((img) => {
        cornerstone.displayImage(imgRef.current, img);
        cornerstone.displayImage(picRef.current, img);
        cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
        cornerstoneTools.addToolState(imgRef.current, "stack", stack);
      });
      setPatientInfo(JSON.parse(sessionStorage.getItem("FILE_INFO")));
      setIsShow(true);
    }
  }, [data]);

  // 获取鼠标移动信息和滚动事件
  const handleMouseMove = (e) => {
    setPosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetX,
    });
    if (imgRef.current && isShow) {
      setViewPort(cornerstone.getViewport(imgRef.current));
    }
  };
  const handleWheel = () => {
    if (imgRef.current && isShow) {
      setViewPort(cornerstone.getViewport(imgRef.current));
    }
  };

  // 选择使用对应工具
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
  // 剪裁图片
  function ScissorPic() {
    // const data = { left: 10, top: 20, width: "20px", height: "20px" };
    // // cancelDrawin
    const ele = document.getElementById("test");
    let viewport = cornerstone.getViewport(ele);

    // cornerstoneTools.clipBoundingBox(imgRef.current , 20, 20);
    // // cornerstoneTools.playClip(imgRef.current, 30)
    // // cornerstone.copyPoints(imgRef.current);
    console.log("eeee");
    // viewport.voi.windowWidth = 90;
    // viewport.voi.windowCenter = 30;
    // cornerstone.setViewport(imgRef.current, viewport);
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
    uploadFile(formdata).then((res) => {
      console.log(res);
    });

    testConnect().then((res) => {
      console.log(res);
    });

    // let fileInfo = await getFileInfo(demoData);
    // console.log(fileInfo);
    // setPatientInfo(fileInfo.data);
    // sessionStorage.setItem("FILE_INFO", JSON.stringify(fileInfo.data));
    // let { PatientID, PatientAge, PatiendAddress } = fileInfo.data;
    // let filePath = await getFilePath(PatientID);
    // console.log("filePath", filePath);
    // sessionStorage.setItem("FILE_PATH", JSON.stringify(filePath.data));
    // setData(sessionStorage.getItem("FILE_PATH"));
    // setIsShow(true);
  }

  // 下载文件
  function downLoad() {
    const data = {
      test1: [
        [1, 1, 1],
        [1, 1, 1, 1],
      ],
      test2: [
        [0, 0, 0, 0],
        [0, 0, 0],
      ],
    };
    btnClickExport(data);
  }

  return (
    <div className="Part2Test">
      <Header />
      <div className="toolBar">
        <div className="left">
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
        <div className="p-picList">
          <div className="showPic">
            <div className="pic" ref={picRef}></div>;
          </div>
        </div>

        <div
          className="detailPicBox"
          onMouseMove={(e) => handleMouseMove(e)}
          onWheel={handleWheel}
        >
          <div className="detailPic" id="test" ref={imgRef}></div>
          {/* {isShow ? (
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
                WW/WL:
                <span>
                  {Math.floor(viewPort.voi.windowWidth)}/
                  {Math.floor(viewPort.voi.windowCenter)}
                </span>
              </div>
            </div>
          ) : null} */}

          {/* {isShow ? (
            <div className="PatientInfo">
              <p>
                Patiend ID :
                {patientInfo.PatientID ? patientInfo.PatientID : "undefined"}
              </p>
              <p>
                Patinet Age :
                {patientInfo.PatientAge ? patientInfo.PatientAge : "undefined"}
              </p>
              <p>
                Patinet Address :
                {patientInfo.PatientAddress
                  ? patientInfo.PatiendAddress
                  : "undefined"}
              </p>
            </div>
          ) : null} */}
        </div>
      </div>
    </div>
  );
}
