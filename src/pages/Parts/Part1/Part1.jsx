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
import { MenuFoldOutlined } from "@ant-design/icons";
import "./Part1.scss";

const mouseToolChain = [
  { name: "Wwwc", func: cornerstoneTools.WwwcTool, config: {} },
  { name: 'ZoomMouseWheel', func: cornerstoneTools.ZoomMouseWheelTool, config: {} },
  { name: "Pan", func: cornerstoneTools.PanTool, config: {} },
  { name: "Magnify", func: cornerstoneTools.MagnifyTool, config: {} },
  { name: "Angle", func: cornerstoneTools.AngleTool, config: {} },
  { name: 'Length', func: cornerstoneTools.LengthTool, config: {} },
  { name: "Eraser", func: cornerstoneTools.EraserTool, config: {} },
  { name: "CircleScissors", func: cornerstoneTools.CircleScissorsTool, config: {} },
  { name: "RectangleScissors", func: cornerstoneTools.RectangleScissorsTool, config: {} },
  { name: "FreehandScissors", func: cornerstoneTools.FreehandScissorsTool, config: {} },
  { name: "Brush", func: cornerstoneTools.BrushTool, config: {} },
];


export function Part1() {

  const [ids, setIds] = useState([])
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  let result = undefined;  // 存储当前选中的 DCM文件解析后的 DataSet 对象
  let fileImgId = '';      // 当前选中的 DCM文件 imageId

  let imageIds = []

  function chooseTool(name) {
    return () => {
      for (let i = 0; i < mouseToolChain.length; i++) {
        if (mouseToolChain[i].name === name) {
          cornerstoneTools.addTool(mouseToolChain[i].func);
          cornerstoneTools.setToolActive(mouseToolChain[i].name, {
            mouseButtonMask: 1
          });
        } else {
          cornerstoneTools.addTool(mouseToolChain[i].func);
          cornerstoneTools.setToolPassive(mouseToolChain[i].name, {
            mouseButtonMask: 1
          });
        }
      }
    }
  }

  cornerstone.metaData.addProvider(function (type, imageId) {
    if (type == "imagePixelModule" && imageId == fileImgId) {
      return getImagePixelModule(result);
    }
    return metaDataProvider(type, imageId);
  })

  function uploadFiles() {
    fileRef.current.click()
  }

  function loadFiles(e) {
    let files = e.target.files;
    if (!files || !files.length) return;

    for (let i = 1; i < files.length; i++) {
      let file = files[i];
      let read = new FileReader();
      imageIds[i - 1] = '';
      read.readAsArrayBuffer(file);
      read.onload = function () {
        result = dicomParser.parseDicom(new Uint8Array(this.result))
        let url = "http://" + file.name;
        fileImgId = "wadouri:" + url
        // imageIds.push(fileImgId)
        imageIds[i - 1] = fileImgId;
        //设置映射关系
        cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.add(url, result);
        cornerstone.imageCache.putImageLoadObject(fileImgId, cornerstoneWADOImageLoader.wadouri.loadImageFromPromise(new Promise((res) => {
          res(result);
        }), fileImgId))

        const stack = {
          currentImageIdIndex: 0,
          imageIds
        }

        //加载dcm文件并缓存
        cornerstone.loadAndCacheImage(imageIds[0]).then(img => {
          cornerstone.displayImage(imgRef.current, img);
          cornerstoneTools.addStackStateManager(imgRef.current, ['stack'])
          cornerstoneTools.addToolState(imgRef.current, 'stack', stack)
        });

      }
    }

  }

  useEffect(() => {
    cornerstone.enable(imgRef.current);
    const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool
    cornerstoneTools.addTool(StackScrollMouseWheelTool)
    cornerstoneTools.setToolActive('StackScrollMouseWheel', {})
    extend()
  }, [])

  return (
    <div className="Part1">
      <Header />
      <div className="toolBar">
        <button className="singleTool" onClick={chooseTool('Wwwc')}>
          <span className="iconfont toolIcons">&#xe635;</span>
          <div className="txt">Wwwc</div>
        </button>

        <button className="singleTool" onClick={chooseTool('ZoomMouseWheel')}>
          <span className="iconfont toolIcons">&#xe7ca;</span>
          <div className="txt">Zoom</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Magnify')}>
          <span className="iconfont toolIcons">&#xe662;</span>
          <div className="txt">Magnify</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Pan')}>
          <span className="iconfont toolIcons">&#xeb70;</span>
          <div className="txt">Pan</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Angle')}>
          <span className="iconfont toolIcons">&#xe631;</span>
          <div className="txt">Angle</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Length')}>
          <span className="iconfont toolIcons">&#xedda;</span>
          <div className="txt">Length</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Eraser')}>
          <span className="iconfont toolIcons">&#xe606;</span>
          <div className="txt">Eraser</div>
        </button>

        <button className="singleTool" onClick={chooseTool('CircleScissors')}>
          <span className="iconfont toolIcons">&#xe61b;</span>
          <div className="txt">Circle</div>
        </button>

        <button className="singleTool" onClick={chooseTool('RectangleScissors')}>
          <span className="iconfont toolIcons">&#xe604;</span>
          <div className="txt">Rectangle</div>
        </button>

        <button className="singleTool" onClick={chooseTool('FreehandScissors')}>
          <span className="iconfont toolIcons">&#xe6ec;</span>
          <div className="txt">Freehand</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Brush')}>
          <span className="iconfont toolIcons">&#xe670;</span>
          <div className="txt">Brush</div>
        </button>



        <button className="uploadTool" onClick={uploadFiles}>
          <div className="txt">上传</div>
          <input type="file" onChange={loadFiles} style={{ display: "none" }} webkitdirectory="true" ref={fileRef} />
        </button>
      </div>

      <div className="p-detail">
        <div className="p-picList">
          <div className="showPic">
            {
              ids.map((item) => {
                return <div className="pic" key={item}></div>;
              })
            }
          </div>
        </div>

        <div className="detailPicBox">
          <div className="detailPic" onContextMenu={() => false} onMouseDown={() => false} ref={imgRef}></div>
        </div>
      </div>
    </div>
  );
}
