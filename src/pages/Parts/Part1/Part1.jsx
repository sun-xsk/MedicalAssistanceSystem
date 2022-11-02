import React, { useState, useRef, useEffect } from "react";
import { cornerstone, dicomParser, cornerstoneWADOImageLoader, getImagePixelModule, metaDataProvider, extend, cornerstoneTools } from "../../../util/js/cornerstone";



import Header from "./Header/Header";
import { MenuFoldOutlined } from "@ant-design/icons";

import "./Part1.scss";


export function Part1() {

  const [ids, setIds] = useState([])
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  let result = undefined;  // 存储当前选中的 DCM文件解析后的 DataSet 对象
  let fileImgId = '';      // 当前选中的 DCM文件 imageId
  let imageIds = [];


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

    for (let i = 0; i <= files.length; i++) {
      let file = files[i];
      // promiseArr.push(loadPromise(file))
      let read = new FileReader();
      read.readAsArrayBuffer(file);
      read.onload = function () {
        result = dicomParser.parseDicom(new Uint8Array(this.result))
        let url = "http://" + file.name;
        fileImgId = "wadouri:" + url
        imageIds.push(fileImgId)
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
        {/* <div className="singleTool">
          <MenuFoldOutlined />
          <div className="txt">顺滑切换图层</div>
        </div>
        <div className="singleTool">
          <MenuFoldOutlined />
          <div className="txt">顺滑切换</div>
        </div>
        <div className="singleTool">
          <MenuFoldOutlined />
          <div className="txt">顺滑</div>
        </div>
        <div className="singleTool">
          <MenuFoldOutlined />
          <div className="txt">顺滑切</div>
        </div> */}
        <button className="singleTool" onClick={uploadFiles}>
          <MenuFoldOutlined />
          <div className="txt">上传图片</div>
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

        <div className="detailPic" onContextMenu={() => false} onMouseDown={() => false} ref={imgRef}></div>
      </div>
    </div>
  );
}
