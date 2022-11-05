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

import Header from "../Header/Header";
import "./Part2Test.scss";

const mouseToolChain = [
  { name: "Wwwc", func: cornerstoneTools.WwwcTool, config: {} },
  {
    name: "ZoomMouseWheel",
    func: cornerstoneTools.ZoomMouseWheelTool,
    config: {},
  },
  { name: "Pan", func: cornerstoneTools.PanTool, config: {} },
  { name: "Magnify", func: cornerstoneTools.MagnifyTool, config: {} },
  { name: "Angle", func: cornerstoneTools.AngleTool, config: {} },
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

  //   上下翻转图片
  function upsideDownTb() {
    const element = document.getElementById("test");
    cornerstone.enable(element);
    result = cornerstone.getViewport(element);
    upTb = !upTb;
    cornerstone.setViewport(element, {
      vflip: upTb,
    });
  }
  function upsideDownLr() {
    const element = document.getElementById("test");
    cornerstone.enable(element);
    result = cornerstone.getViewport(element);
    upLr = !upLr;
    cornerstone.setViewport(element, {
      hflip: upLr,
    });
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
        <button className="singleTool" onClick={chooseTool("Wwwc")}>
          <span className="iconfont toolIcons">&#xe635;</span>
          <div className="txt">图像加强</div>
        </button>

        {/* chooseTool("ZoomMouseWheel") */}
        <button className="singleTool" onClick={chooseTool("ZoomMouseWheel")}>
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

        <button className="singleTool" onClick={chooseTool("Angle")}>
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
