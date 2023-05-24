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
import httpUtil from "../../../util/axios/httpUtil";
import Header from "../Header/Header";
import "./Part2Test.scss";
// import axios from "axios";
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
  const [ids, setIds] = useState([0]);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  let upTb = false;
  let upLr = false;
  let result = undefined; // 存储当前选中的 DCM文件解析后的 DataSet 对象
  let fileImgId = ""; // 当前选中的 DCM文件 imageId
  let imageIds = [];

  // httpUtil.getRegisterStatus().then((res) => {
  //   console.log(res);
  // });
  // axios
  //   .get("http://43.142.168.114:8001/MedicalSystem/file/testConnect")
  //   .then((res) => {
  //     console.log(res);
  //   });
  //   判断是需要哪一个工具
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
            mouseToolChain[i].name,
            {
              mouseButtonMask: 1,
            }
          );
        } else {
          cornerstoneTools.addToolForElement(
            imgRef.current,
            mouseToolChain[i].func
          );
          cornerstoneTools.setToolPassiveForElement(
            imgRef.current,
            mouseToolChain[i].name,
            {
              mouseButtonMask: 1,
            }
          );
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
  /* function ScissorPic() {
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
  } */
  function LimpidPic() {
    // 拿到当前的canvas组件
    const canvas = document.getElementsByClassName("cornerstone-canvas")[0];
    const ctx = canvas.getContext("2d");

    // 获取图片像素信息
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    // 获取一行的间隔为space，让一个像素点的数据间隔为4（是rgba颜色值）
    const space = imageData.width * 4;
    console.log(space, "...", data.length);
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
  //图片降噪
  function denoiseImage() {
    if (!cv) return;

    const imgCanvas = document.getElementsByClassName("cornerstone-canvas")[0];
    //获取图片数据
    const matImage = cv.imread(imgCanvas)
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
  function loadFiles(e) {
    let files = e.target.files;
    if (!files || !files.length) return;
    const formdata = new FormData();
    formdata.append("file", files[0]);
    console.log(files[0]);
    imageIds = [];
    for (let i = 1; i < files.length; i++) {
      let file = files[i];
      let read = new FileReader();
      imageIds[i - 1] = "";
      read.readAsArrayBuffer(file);
      read.onload = function () {
        result = dicomParser.parseDicom(new Uint8Array(this.result));
        let url = "http://" + file.name;
        fileImgId = "wadouri:" + url;
        // imageIds.push(fileImgId)
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
  }

  // 下载文件
  function downLoad() {
    const data = { test1: [[1, 1, 1], [1, 1, 1, 1]], test2: [[0, 0, 0, 0], [0, 0, 0]] };
    btnClickExport(data);
  }

  useEffect(() => {
    cornerstone.enable(imgRef.current);
    const StackScrollMouseWheelTool =
      cornerstoneTools.StackScrollMouseWheelTool;
    cornerstoneTools.addTool(StackScrollMouseWheelTool);
    cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
    extend();
  }, []);
  //图像剪裁
  const clip = () => {
    const clipAreaWrap = useRef(null); // 截图区域dom
    //const clipAreaWrap = imgRef; //截图区域dom
    const clipCanvas = useRef(null); // 用于截图的的canvas，以及截图开始生成截图效果（背景置灰）
    //const drawCanvas = useRef(null) // 把图片绘制到canvas上方便 用于生成截取图片的base64数据
    const drawCanvas = document.getElementsByClassName("cornerstone-canvas")[0];
    const [clipImgData, setClipImgData] = useState("");

    const init = (wrap) => {
      if (!wrap) return;
      clipAreaWrap.current = wrap;
      console.log(wrap, clipAreaWrap);
      clipCanvas.current = document.createElement("canvas");
      //drawCanvas.current = document.createElement('canvas')
      clipCanvas.current.style =
        "width:100%;height:100%;z-index: 2;position: absolute;left: 0;top: 0;";
      //drawCanvas.current.style =
      //'width:100%;height:100%;z-index: 1;position: absolute;left: 0;top: 0;'
      clipAreaWrap.current.appendChild(clipCanvas.current);
      clipAreaWrap.current.appendChild(drawCanvas);
    };
    // 截图
    const cut = (souceImg) => {
      const drawCanvasCtx = drawCanvas.getContext("2d");
      const clipCanvasCtx = clipCanvas.current.getContext("2d");

      const wrapWidth = clipAreaWrap.current.clientWidth;
      const wrapHeight = clipAreaWrap.current.clientHeight;
      clipCanvas.current.width = wrapWidth;
      clipCanvas.current.height = wrapHeight;
      //drawCanvas.current.width = wrapWidth
      //drawCanvas.current.height = wrapHeight

      // 设置截图时灰色背景
      clipCanvasCtx.fillStyle = "rgba(0,0,0,0.6)";
      clipCanvasCtx.strokeStyle = "rgba(0,143,255,1)";

      // 生成一个截取区域的img 然后把它作为canvas的第一个参数
      const clipImg = document.createElement("img");
      clipImg.classList.add("img_anonymous");
      clipImg.crossOrigin = "anonymous";
      //clipImg.src = souceImg

      // 那其实画的是原始大小的clipImg
      clipAreaWrap.current.appendChild(clipImg);

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
          //生成base64格式的图
          setClipImgData(url);
        }
      });
    };

    const cancelCut = () => {
      clipCanvas.current.width = clipAreaWrap.current.clientWidth;
      clipCanvas.current.height = clipAreaWrap.current.clientHeight;
      drawCanvas.current.width = clipAreaWrap.current.clientWidth;
      drawCanvas.current.height = clipAreaWrap.current.clientHeight;
      const drawCanvasCtx = drawCanvas.current.getContext("2d");
      const clipCanvasCtx = clipCanvas.current.getContext("2d");
      drawCanvasCtx.clearRect(
        0,
        0,
        drawCanvas.current.clientWidth,
        drawCanvas.current.clientHeight
      );
      clipCanvasCtx.clearRect(
        0,
        0,
        clipCanvas.current.clientWidth,
        clipCanvas.current.clientHeight
      );
      //移除鼠标事件
      clipCanvas.current.onmousedown = null;
      clipCanvas.current.onmousemove = null;
    };

    const getClipPicUrl = (area, drawCanvasCtx) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const data = drawCanvasCtx.getImageData(
        0,
        0,
        drawCanvasCtx.canvas.clientWidth,
        drawCanvasCtx.canvas.clientHeight
      );
      // const data = drawCanvasCtx.getImageData(area.x, area.y, area.w, area.h)
      canvas.width = area.w;
      canvas.height = area.h;
      context.putImageData(data, 0, 0);
      return canvas.toDataURL("image/png", 1);
    };

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
    return { init, cut, cancelCut, clipImgData };
  };

  const { init, cut, cancelCut, clipImgData } = clip();
  return (
    <div className="Part2Test">
      <Header />
      <div className="toolBar">
        <div className="left">
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

          {/* <button className="singleTool" onClick={chooseTool("ZoomMouseWheel")}>
            <span className="iconfont toolIcons">&#xe631;</span>
            <div className="txt">图像剪裁</div>
          </button> */}
          {/* <button
            className="singleTool"
            onClick={() => {
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
          </button> */}
          <button className="singleTool" onClick={() => {
            init(imgRef.current)
            cut()
          }}>
            <span className="iconfont to
          olIcons">&#xe631;</span>
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
        <div className="clip-img-area">
          <img src={clipImgData} alt="" id="img" />
        </div>

        <div className="p-picList">
          <div className="showPic">
            {ids.map((item, index) => {
              return <div key={index}></div>;
            })}
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
        </div>
      </div>
    </div>
  );
}
