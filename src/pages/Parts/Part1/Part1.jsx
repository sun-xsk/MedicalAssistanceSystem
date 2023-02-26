import React, { useState, useRef, useEffect } from "react";
import {
  cornerstone,
  // dicomParser,
  // cornerstoneWADOImageLoader,
  cornerstoneTools,
} from "../../../util/js/cornerstone";

import {
  testConnect,
  uploadFile,
  // getInstanceNumbers,
  // getDicomFile,
  getFileInfo,
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
  let [viewPort, setViewPort] = useState({});
  const [patientInfo,setPatientInfo] = useState({})
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    cornerstone.enable(imgRef.current);
    cornerstone.enable(picRef.current); 
    setViewPort( viewPort =>({
      ...viewPort,
      voi: { windowWidth: "", windowCenter: "" },
      scale: 0,
    }))
  }, []);


  let getImageId = (seriesInstanceUID,instanceNumber) =>{
    return 'wadouri:'+'http://43.142.168.114:8001/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?'+
            `seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`
  }

  useEffect(()=>{
      let path=JSON.parse(sessionStorage.getItem("FILE_PATH")) || null
      if(path){
      let imageIds=path
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
      setPatientInfo(JSON.parse(sessionStorage.getItem('PATIENT_INFO')))
      setIsShow(true)
    }
  },[isShow])

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
    // let mainShow = await getMainShow(demoData)
    // console.log(mainShow);
    //此处
    let patientInfo={...fileInfo.data}
    console.log(patientInfo)
    //添加文件id
    let filePaths=[]
    for(let i=1;i<=files.length;i++){
      filePaths.push(getImageId(patientInfo.SeriesInstanceUID,i))
    }
    sessionStorage.setItem("FILE_PATH",JSON.stringify(filePaths))
    sessionStorage.setItem("PATIENT_INFO",JSON.stringify(patientInfo))
    setIsShow(true)
  }
 
  const handleMouseMove = (e) => {
    setPosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetX,
    });
    if (imgRef.current && isShow) {
      setViewPort(viewPort =>({...viewPort,...cornerstone.getViewport(imgRef.current)}) );
    }
  };
  const handleWheel = () => {
    if (imgRef.current && isShow) {
      // console.log(cornerstone.getViewport(imgRef.current));
      setViewPort(viewPort =>({...viewPort,...cornerstone.getViewport(imgRef.current)}));
    }
  };
  return (
    <div className="Part1">
      <Header />
      <div className="toolBar">
      <button className="singleTool" onClick={chooseTool("StackScrollMouseWheel")}>
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

        <button className="singleTool" onClick={chooseTool("CircleScissors")}>
          <span className="iconfont toolIcons">&#xe61b;</span>
          <div className="txt">圆形标注</div>
        </button>

        <button
          className="singleTool"
          onClick={chooseTool("RectangleScissors")}
        >
          <span className="iconfont toolIcons">&#xe604;</span>
          <div className="txt">矩形标注</div>
        </button>

        <button className="singleTool" onClick={chooseTool("FreehandScissors")}>
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
              <p>Patient Name : {patientInfo.PatientName ? patientInfo.PatientName : "undefined"}</p>
              <p>Patient ID : {patientInfo.PatientID ? patientInfo.PatientID : "undefined"}</p>
              <p>Patinet Age : {patientInfo.PatientAge ?  patientInfo.PatientAge : "undefined" }</p>
              <p>Patinet Address : {patientInfo.PatientAddress ?  patientInfo.PatientAddress : "undefined" }</p>
            </div>
          ) : null}
          {isShow ? (
            <div className="study">
                <p>Modality : {patientInfo.Modality ? patientInfo.Modality : 'undefined'}</p>
                <p>Study Date : {patientInfo.StudyDate ? patientInfo.StudyDate : "undefined"}</p>
                <p>Accession Number : {patientInfo.AccessionNumber ? patientInfo.AccessionNumber : 'undefined'}</p>
            </div>
          ) :null
          }
        </div>
      </div>
    </div>
  );
}
