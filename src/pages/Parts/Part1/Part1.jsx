import React, { useState, useRef, useEffect } from "react";
import useSyncCallback from "../../../util/js/useSyncCallback"

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

import myStore from '../../../util/store/store'
import { addLabeltoState, setLabelName, deleteLabeltoState } from "../../../util/store/store";
import Header from "../Header/Header";
import Item from "./Item/Item"
import Detail from './Detail/Detail'
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

const toolState = {};

let activeToolName = ""; // 激活工具名称
let prevToolName = ""; // 上一个激活工具名称
let uuids = []

function marker() {
  return {
    configuration: {
      markers: ["F5", "F4", "F3", "F2", "F1"], //标记数组
      current: 'F3', //要对应markers
      loop: true, //是否循环
      ascending: false, //true 降序 false 升序
      changeTextCallback: function (data, eventData, doneChangingTextCallback) {
        data.visible = true; //是否可见, 默认true
        data.color = "#38f"; //文字颜色
        data.text = "内容"; //修改内容  这里修改了也没有，因为默认使用第二个参数
        doneChangingTextCallback(data, prompt('改变标注:'));
      }
    }
  }
}


export function Part1() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  // const picRef = useRef(null);
  let [viewPort, setViewPort] = useState({});
  const [patientInfo, setPatientInfo] = useState({})
  const [isShow, setIsShow] = useState(false);
  const [details, setDetails] = useState([]);
  let [data, setData] = useState([])
  let [obj, setObj] = useState({})


  useEffect(() => {
    cornerstone.enable(imgRef.current);

    setDetails(myStore.getState().labelDetails);

    myStore.subscribe(() => {
      let newLableDetails = myStore.getState().labelDetails;
      setDetails([...newLableDetails])
    })


    //添加绘图事件
    imgRef.current.addEventListener(cornerstoneTools.EVENTS.MEASUREMENT_COMPLETED, e => {
      let detail = e.detail.measurementData;
      detail.tagName = " "
      detail.toolName = e.detail.toolName

      let ifhad = false

      uuids.forEach((item) => {
        if (item == detail.uuid) {
          ifhad = true
        }
      })

      if (!ifhad) {
        uuids.push(detail.uuid)
        setTimeout(() => {
          let detailString = JSON.stringify(detail)
          myStore.dispatch(addLabeltoState(detailString))
        }, 100)
      }

    })


    setViewPort(viewPort => ({
      ...viewPort,
      voi: { windowWidth: "", windowCenter: "" },
      scale: 0,
    }))
  }, []);

  // useEffect(() => {
  //   console.log(details);
  // }, [details])


  let getImageId = (seriesInstanceUID, instanceNumber) => {
    return 'wadouri:' + 'http://43.142.168.114:8001/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?' +
      `seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}`
  }

  useEffect(() => {
    let path = JSON.parse(sessionStorage.getItem("FILE_PATH")) || null
    if (path) {
      let imageIds = path
      let stack = {
        currentImageIdIndex: 0,
        imageIds,
      };
      cornerstone.loadAndCacheImage(imageIds[0]).then((img) => {
        cornerstone.displayImage(imgRef.current, img);
        cornerstoneTools.addStackStateManager(imgRef.current, ["stack"]);
        cornerstoneTools.addToolState(imgRef.current, "stack", stack);
      });
      setPatientInfo(JSON.parse(sessionStorage.getItem('PATIENT_INFO')))
      setIsShow(true)
      setData(JSON.parse(sessionStorage.getItem("FILE_PATH")))
    }
  }, [isShow])

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
      const tool = name
      if (!tool) return;
      if (prevToolName) {
        cornerstoneTools.setToolPassiveForElement(imgRef.current, prevToolName, {
          mouseButtonMask: 1,
        }); // 把上一个激活工具冻结
      }
      activeToolName = tool + "Tool";
      if (!toolState[activeToolName]) {
        // 不能重复 addTool
        cornerstoneTools.addToolForElement(imgRef.current, cornerstoneTools[activeToolName], tool === "TextMarker" ? marker() : {});
        toolState[activeToolName] = true;
      }
      prevToolName = tool;
      // 激活工具
      cornerstoneTools.setToolActiveForElement(imgRef.current,
        tool,
        {
          mouseButtonMask: 1
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
    let patientInfo = { ...fileInfo.data }
    // console.log(patientInfo)
    //添加文件id
    let filePaths = []
    for (let i = 1; i <= files.length; i++) {
      filePaths.push(getImageId(patientInfo.SeriesInstanceUID, i))
    }
    sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths))
    sessionStorage.setItem("PATIENT_INFO", JSON.stringify(patientInfo))
    setIsShow(true)
    setData(filePaths)
  }


  const handleMouseMove = (e) => {
    setPosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetX,
    });
    if (imgRef.current && isShow) {
      setViewPort(viewPort => ({ ...viewPort, ...cornerstone.getViewport(imgRef.current) }));
    }
  };
  const handleWheel = () => {
    if (imgRef.current && isShow) {
      setViewPort(viewPort => ({ ...viewPort, ...cornerstone.getViewport(imgRef.current) }));
    }
  };

  //负责导出文件
  const handleExport = () => {
    if (Object.getOwnPropertyNames(details).length == 0) {
      return;
    }

    let title=['PatientID','PatientName','SeriesInstanceUID','Modality', 'PatientAddress', 'PatientAge',
         "StudyDate","Label",'AnnotationType','Length','Points']
    
    //填充基本信息和类型
    let str=[]
    str.push(title.join(',') + '\r\n');

    for(let i= 0;i<details.length;i++){
      let arr = new Array(title.length).fill("")
      for(let j=0; j<title.length; j++){
        if(title[j] in patientInfo){
          arr[j]=patientInfo[title[j]]
        }
        else if(title[j]=="AnnotationType"){
          arr[j]= details[i].toolName
        }
        else if(title[j] == "Label"){
          arr[j] = details[i].tagName
        }
        else if(title[j] == "Length"){
          arr[j] = details[i].length
        }
        else if(title[j] == "Points"){
          let reg = new RegExp("\"","g")
          let points=JSON.stringify(details[i].handles)
          arr[j] = points.replace(reg,"\"\"")
          arr[j] = "\"" + arr[j] + "\""
        }
      }
      str.push(arr.join(',') + '\r\n');
    }



    const blob = new Blob(['\uFEFF' + str.join('')], {
      type: 'test/csv;charset=utf-8',
    });
    //导出
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    //导出文件的文件名
    downloadLink.download = patientInfo.PatientID + '.csv';
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  }
  //导出文件具体方法


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

        <button className="singleTool" onClick={chooseTool("CircleRoi")}>
          <span className="iconfont toolIcons">&#xe61b;</span>
          <div className="txt">圆形标注</div>
        </button>

        <button
          className="singleTool"
          onClick={chooseTool("RectangleRoi")}
        >
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
        <div className="p-picList">
          <div className="showPic">
            {/* {data.map((item, index) => {
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
              <p>Patinet Age : {patientInfo.PatientAge ? patientInfo.PatientAge : "undefined"}</p>
              <p>Patinet Address : {patientInfo.PatientAddress ? patientInfo.PatientAddress : "undefined"}</p>
            </div>
          ) : null}
          {isShow ? (
            <div className="study">
              <p>Modality : {patientInfo.Modality ? patientInfo.Modality : 'undefined'}</p>
              <p>Study Date : {patientInfo.StudyDate ? patientInfo.StudyDate : "undefined"}</p>
              <p>Accession Number : {patientInfo.AccessionNumber ? patientInfo.AccessionNumber : 'undefined'}</p>
            </div>
          ) : null
          }
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
              {
                details.map((detail, index) => {
                  return <Detail detail={detail} index={index} key={detail.uuid} />
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
