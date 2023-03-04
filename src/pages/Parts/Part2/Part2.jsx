import React, { useState, useRef, useEffect } from "react";
import Item from "./Item/Item";
import { cornerstone, cornerstoneTools } from "../../../util/js/cornerstone";

import {
  uploadFile,
  getFileInfo,
  getInstanceNumbers,
} from "../../../util/api/httpUtil";

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
  let [viewPort, setViewPort] = useState({});
  const [patientInfo, setPatientInfo] = useState({});
  const [isShow, setIsShow] = useState(false);
  let [data, setData] = useState([]);
  // 用于控制图像上下翻转
  let upTb = false;
  let upLr = false;

  useEffect(() => {
    cornerstone.enable(imgRef.current);
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

  // 设置请求去噪过后的dcm文件id
  const getLimpidImgId = (seriesInstanceUID, instanceNumber, type) => {
    return (
      "wadouri:" +
      "http://43.142.168.114:8001/MedicalSystem/file/getDicomFileBySeriesInstanceUIDAndInstanceNumber?" +
      `seriesInstanceUID=${seriesInstanceUID}&instanceNumber=${instanceNumber}&type=${type}`
    );
  };

  // 将具体完整的路径挂载到cornostone组件库上面
  useEffect(() => {
    // 通过完整路径展示dcm图片
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
          cornerstoneTools.addToolForElement(
            imgRef.current,
            mouseToolChain[i].func
          );
          cornerstoneTools.setToolActiveForElement(
            imgRef.current,
            mouseToolChain[i].name, {
            mouseButtonMask: 1,
          });
        } else {
          cornerstoneTools.addToolForElement(
            imgRef.current,
            mouseToolChain[i].func
          );
          cornerstoneTools.setToolPassiveForElement(
            imgRef.current,
            mouseToolChain[i].name, {
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
    uploadFile(formdata).then((res) => {
      console.log(res);
    });

    // 获取病人信息
    let fileInfo = await getFileInfo(demoData);
    console.log(fileInfo);
    let patientInfo = { ...fileInfo.data };
    console.log(patientInfo);

    //添加文件id
    // 在这里生成获取到的dcm序列所有的完整路径
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
  // 上下左右翻转图片
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
  async function LimpidPic(type) {
    let instanceNumber = await getInstanceNumbers(
      patientInfo.SeriesInstanceUID
    );
    console.log(patientInfo.SeriesInstanceUID);
    console.log(instanceNumber);
    // 在这里生成获取到的dcm序列所有的完整路径
    let filePaths = [];
    for (let i = 1; i <= instanceNumber.data.length; i++) {
      filePaths.push(getLimpidImgId(patientInfo.SeriesInstanceUID, i, type));
    }
    sessionStorage.setItem("FILE_PATH", JSON.stringify(filePaths));
    setIsShow(!isShow);
    setData(filePaths);
  }

  //图像剪裁1
  const tailor = () => {
    console.log(imgRef);

  }
  //图像剪裁
  const clip = () => {
    const clipAreaWrap = useRef(null) // 截图区域dom
    //const clipAreaWrap = imgRef; //截图区域dom
    const clipCanvas = useRef(null) // 用于截图的的canvas，以及截图开始生成截图效果（背景置灰）
    //const drawCanvas = useRef(null) // 把图片绘制到canvas上方便 用于生成截取图片的base64数据
    const drawCanvas = document.getElementsByClassName('cornerstone-canvas')[0];
    const [clipImgData, setClipImgData] = useState('')

    const init = (wrap) => {
      if (!wrap) return
      clipAreaWrap.current = wrap
      console.log(wrap, clipAreaWrap);
      clipCanvas.current = document.createElement('canvas')
      //drawCanvas.current = document.createElement('canvas')
      clipCanvas.current.style =
        'width:100%;height:100%;z-index: 2;position: absolute;left: 0;top: 0;'
      //drawCanvas.current.style =
      //'width:100%;height:100%;z-index: 1;position: absolute;left: 0;top: 0;'
      clipAreaWrap.current.appendChild(clipCanvas.current)
      clipAreaWrap.current.appendChild(drawCanvas)
    }
    // 截图
    const cut = (souceImg) => {
      const drawCanvasCtx = drawCanvas.getContext('2d')
      const clipCanvasCtx = clipCanvas.current.getContext('2d')

      const wrapWidth = clipAreaWrap.current.clientWidth
      const wrapHeight = clipAreaWrap.current.clientHeight
      clipCanvas.current.width = wrapWidth
      clipCanvas.current.height = wrapHeight
      //drawCanvas.current.width = wrapWidth
      //drawCanvas.current.height = wrapHeight

      // 设置截图时灰色背景
      clipCanvasCtx.fillStyle = 'rgba(0,0,0,0.6)'
      clipCanvasCtx.strokeStyle = 'rgba(0,143,255,1)'

      // 生成一个截取区域的img 然后把它作为canvas的第一个参数
      const clipImg = document.createElement('img')
      clipImg.classList.add('img_anonymous')
      clipImg.crossOrigin = 'anonymous'
      //clipImg.src = souceImg

      // 那其实画的是原始大小的clipImg
      clipAreaWrap.current.appendChild(clipImg)

      // 绘制截图区域
      clipImg.onload = () => {
        // x,y -> 计算从drawCanvasCtx的的哪一x,y坐标点进行绘制
        const x = Math.floor((wrapWidth - clipImg.width) / 2)
        const y = Math.floor((wrapHeight - clipImg.height) / 2)
        // 用这个宽高在drawCanvasCtx的绘图只会绘制clipImg的小部分内容（因为假宽高比真宽高小），看起来就像是被放大了
        const clipImgCopy = clipImg.cloneNode()
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
        )
      }

      let start = null

      // 获取截图开始的点
      clipCanvas.current.onmousedown = function (e) {
        start = {
          x: e.offsetX,
          y: e.offsetY
        }
      }

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
          )
        }
      }

      // 截图完毕，获取截图图片数据
      document.addEventListener('mouseup', function (e) {
        if (start) {
          var url = getClipPicUrl(
            {
              x: start.x,
              y: start.y,
              w: e.offsetX - start.x,
              h: e.offsetY - start.y
            },
            drawCanvasCtx
          )
          start = null
          //生成base64格式的图
          setClipImgData(url)
        }
      })
    }

    const cancelCut = () => {
      clipCanvas.current.width = clipAreaWrap.current.clientWidth
      clipCanvas.current.height = clipAreaWrap.current.clientHeight
      drawCanvas.current.width = clipAreaWrap.current.clientWidth
      drawCanvas.current.height = clipAreaWrap.current.clientHeight
      const drawCanvasCtx = drawCanvas.current.getContext('2d')
      const clipCanvasCtx = clipCanvas.current.getContext('2d')
      drawCanvasCtx.clearRect(
        0,
        0,
        drawCanvas.current.clientWidth,
        drawCanvas.current.clientHeight
      )
      clipCanvasCtx.clearRect(
        0,
        0,
        clipCanvas.current.clientWidth,
        clipCanvas.current.clientHeight
      )
      //移除鼠标事件
      clipCanvas.current.onmousedown = null
      clipCanvas.current.onmousemove = null
    }

    const getClipPicUrl = (area, drawCanvasCtx) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const data = drawCanvasCtx.getImageData(0, 0, drawCanvasCtx.canvas.clientWidth, drawCanvasCtx.canvas.clientHeight);
     // const data = drawCanvasCtx.getImageData(area.x, area.y, area.w, area.h)
      canvas.width = area.w
      canvas.height = area.h
      context.putImageData(data, 0, 0)
      return canvas.toDataURL('image/png', 1)
    }

    // 绘制出截图的效果
    const fill = (context, ctxWidth, ctxHeight, x, y, w, h) => {
      context.clearRect(0, 0, ctxWidth, ctxHeight)
      context.beginPath()
      //遮罩层
      context.globalCompositeOperation = 'source-over'
      context.fillRect(0, 0, ctxWidth, ctxHeight)
      //画框
      context.globalCompositeOperation = 'destination-out'
      context.fillRect(x, y, w, h)
      //描边
      context.globalCompositeOperation = 'source-over'
      context.moveTo(x, y)
      context.lineTo(x + w, y)
      context.lineTo(x + w, y + h)
      context.lineTo(x, y + h)
      context.lineTo(x, y)
      // context.stroke()
      context.closePath()
    }
    return { init, cut, cancelCut, clipImgData }
  }

  const { init, cut, cancelCut, clipImgData } = clip()

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

        <div className="singleTool">
          <span className="iconfont toolIcons">&#xe7ca;</span>
          <div className="txt">图像去噪</div>
          <div className="detailLimpid">
            <button onClick={LimpidPic.bind(this, 1)}>高斯</button>
            <button onClick={LimpidPic.bind(this, 2)}>中值</button>
            <button onClick={LimpidPic.bind(this, 3)}>均值</button>
            {/* <button>不去噪</button> */}
          </div>
        </div>

        <button className="singleTool" onClick={upsideDownTb}>
          <span className="iconfont toolIcons">&#xe662;</span>
          <div className="txt">上下翻转</div>
        </button>

        <button className="singleTool" onClick={upsideDownLr}>
          <span className="iconfont toolIcons">&#xeb70;</span>
          <div className="txt">左右翻转</div>
        </button>

        <button className="singleTool" onClick={() => {
          init(imgRef.current)
          cut()
        }}>
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
            {data.map((item, index) => {
              return <Item key={index} data={item}></Item>
            })}
            {/* <div className="pic" ref={picRef}></div>; */}
          </div>
        </div>

        <div
          className="detailPicBox"
          onMouseMove={(e) => handleMouseMove(e)}
          onWheel={handleWheel}
        >

          {/* 截图图片显示区域 */}
          <div className="clip-img-area">
            <img src={clipImgData} alt="" id="img" />
          </div>
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
