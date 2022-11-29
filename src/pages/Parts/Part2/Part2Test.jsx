import React, { useState, useRef, useEffect } from "react";
import {
  cornerstone,
  dicomParser,
  cornerstoneWADOImageLoader,
  getImagePixelModule,
  metaDataProvider,
  extend,
  cornerstoneTools,
} from "../../../util/js/cornerstone";

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
    // httpUtil.upLoadFile(files[0]).then((res) => {
    //   console.log(res);
    // });
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
            {ids.map((item) => {
              return <div className="pic" key={item}></div>;
            })}
          </div>
        </div>

        <div className="detailPicBox">
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
