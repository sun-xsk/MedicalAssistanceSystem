import React, { useState, useRef, useEffect } from "react";
import Header from './Header/index'
import './Part2.scss'

import {
  cornerstone,
  dicomParser,
  cornerstoneWADOImageLoader,
  getImagePixelModule,
  metaDataProvider,
  extend,
  cornerstoneTools,
} from "../../../util/js/cornerstone";

export function Part2() {
  const [ids, setIds] = useState([]);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  let imageIds = [];
  let fileImgId = '';
  let result = undefined;
  const mouseToolChain = [
    { name: "Scissor", func: cornerstoneTools.FreehandScissorsTool, config: {} },
    { name: "LRflip", func: cornerstoneTools },
    { name: "UDflip", func: cornerstoneTools }
  ]

  cornerstone.metaData.addProvider(function (type, imageId) {
    if (type == "imagePixelModule" && imageId == fileImgId) {
      return getImagePixelModule(result);
    }
    return metaDataProvider(type, imageId);
  })

  const uploadFiles = () => {
    fileRef.current.click()

  }
  const loadFiles = (e) => {
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

  const chooseTool = (name) => {
    return () => {
      mouseToolChain.map((tool) => {
        if (tool.name === name) {
          cornerstoneTools.addTool(tool.func);
          cornerstoneTools.setToolActive(tool.tool, {
            mouseButtonMask: 1
          })
        } else {
          cornerstone.addTool(tool.func);
          cornerstone.setToolPassive(tool.tool, {
            mouseButtonMask: 1
          })
        }
      })
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
    <div className="Part2">
      <Header />
      <div className="toolBar">
        <button className="singleTool" >
          <span className="iconfont toolIcons">&#xe63a;</span>
          <div className="txt">去噪</div>
        </button>

        <button className="singleTool" >
          <span className="iconfont toolIcons">&#xe654;</span>
          <div className="txt">增强</div>
        </button>

        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe605;</span>
          <div className="txt">左右翻转</div>
        </button>

        <button className="singleTool" >
          <span className="iconfont toolIcons">&#xe606;</span>
          <div className="txt">上下翻转</div>
        </button>

        <button className="singleTool" onClick={chooseTool('Scissors')}>
          <span className="iconfont toolIcons">&#xe7cd;</span>
          <div className="txt">Scissor</div>
        </button>
        <button className="uploadTool" onClick={uploadFiles}>
          <div className="txt">上传</div>
          <input type="file" onChange={loadFiles} ref={fileRef} style={{ display: "none" }} webkitdirectory="true" />
        </button>
      </div>

      <div className="p-detail">
        <div className="p-picList">
          <div className="showPic">
            {
              ids.map((pic) => {
                return <div className="pic" key={pic}></div>
              })
            }
          </div>
        </div>

        <div className="detailPicBox">
          <div className="detailPic" onContextMenu={() => false} onMouseDown={() => false} ref={imgRef} ></div>
        </div>
      </div>
    </div>
  );
}
