import React, { useState, useRef, useEffect } from "react";
import {
  cornerstone,
  dicomParser,
  cornerstoneWADOImageLoader,
  cornerstoneTools,
} from "../../../util/js/cornerstone";

import {
  getFileInfo,
  uploadFile,
  getFilePath,
} from "../../../util/api/httpUtil";

import Header from "./Header/Header";
import "./Part1.scss";

const mouseToolChain = [
  { name: "StackScrollMouseWheel", func: cornerstoneTools.StackScrollMouseWheelTool, config: {} },
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

export function Part1() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const picRef = useRef(null);
  const [viewPort, setViewPort] = useState({
    voi: { windowWidth: "", windowCenter: "" },
    scale: 0,
  });
  const [patientInfo,setPatientInfo] = useState({})
  const [isShow, setIsShow] = useState(false);
  let [data,setData]=useState("")
  useEffect(() => {
    cornerstone.enable(imgRef.current);
    cornerstone.enable(picRef.current);
    // const StackScrollMouseWheelTool =
    //   cornerstoneTools.StackScrollMouseWheelTool;
    // cornerstoneTools.addTool(StackScrollMouseWheelTool);
    // cornerstoneTools.setToolActive("StackScrollMouseWheel", {});  
  }, []);
  useEffect(()=>{
    let path=JSON.parse(sessionStorage.getItem("FILE_PATH")) || null
    console.log(path);
    if(path){ 
      let images = path[Object.keys(path)[0]];
      //imageIds初始化及排序
      let imageIds = images.map((item) => {
        return "wadouri:" + item;
      });
      imageIds.sort((a,b)=>{
        return a.replace(/(.*\/)*([^.]+).*/ig,"$2") - b.replace(/(.*\/)*([^.]+).*/ig,"$2")
      })
  
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
    }
   
  },[data])

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
    setPatientInfo(fileInfo.data)
    let {
      PatientID,
      PatientAge,
      PatiendAddress
    } = fileInfo.data
    let filePath = await getFilePath(PatientID);
    console.log('filePath',filePath);
    sessionStorage.setItem("FILE_PATH",JSON.stringify(filePath.data))
    setData(sessionStorage.getItem("FILE_PATH"))
    setIsShow(true);
  }
 
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
  return (
    <div className="Part1">
      <Header />
      <div className="toolBar">
      <button className="singleTool" onClick={chooseTool("StackScrollMouseWheel")}>
          <span className="iconfont toolIcons">&#xe6f6;</span>
          <div className="txt">Scroll</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Wwwc")}>
          <span className="iconfont toolIcons">&#xe635;</span>
          <div className="txt">Wwwc</div>
        </button>

        <button className="singleTool" onClick={chooseTool("ZoomMouseWheel")}>
          <span className="iconfont toolIcons">&#xe7ca;</span>
          <div className="txt">Zoom</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Magnify")}>
          <span className="iconfont toolIcons">&#xe662;</span>
          <div className="txt">Magnify</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Pan")}>
          <span className="iconfont toolIcons">&#xeb70;</span>
          <div className="txt">Pan</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Angle")}>
          <span className="iconfont toolIcons">&#xe631;</span>
          <div className="txt">Angle</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Length")}>
          <span className="iconfont toolIcons">&#xedda;</span>
          <div className="txt">Length</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Eraser")}>
          <span className="iconfont toolIcons">&#xe606;</span>
          <div className="txt">Eraser</div>
        </button>

        <button className="singleTool" onClick={chooseTool("CircleScissors")}>
          <span className="iconfont toolIcons">&#xe61b;</span>
          <div className="txt">Circle</div>
        </button>

        <button
          className="singleTool"
          onClick={chooseTool("RectangleScissors")}
        >
          <span className="iconfont toolIcons">&#xe604;</span>
          <div className="txt">Rectangle</div>
        </button>

        <button className="singleTool" onClick={chooseTool("FreehandScissors")}>
          <span className="iconfont toolIcons">&#xe6ec;</span>
          <div className="txt">Freehand</div>
        </button>

        <button className="singleTool" onClick={chooseTool("Brush")}>
          <span className="iconfont toolIcons">&#xe670;</span>
          <div className="txt">Brush</div>
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
        <div className="p-picList">
          <div className="showPic">
            {/* {ids.map((item) => {
              return <div className="pic" key={item}></div>;
            })} */}
            <div className="pic" ref={picRef}></div>;
          </div>
        </div>

        <div
          className="detailPicBox"
          onMouseMove={(e) => handleMouseMove(e)}
          onWheel={handleWheel}
        >
          <div className="detailPic" ref={imgRef}></div>

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
              <p>Patiend ID : {patientInfo.PatientID ? patientInfo.PatientID : "undefined"}</p>
              <p>Patinet Age : {patientInfo.PatientAge ?  patientInfo.PatientAge : "undefined" }</p>
              <p>Patinet Address : {patientInfo.PatientAddress ?  patientInfo.PatiendAddress : "undefined" }</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
