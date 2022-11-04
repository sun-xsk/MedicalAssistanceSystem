import React, { useState } from "react";
import Header from './Header/index'
import './Part2.scss'
export function Part2() {

  return (
    <div className="Part2">
      <Header />
      <div className="toolBar">
        <button className="singleTool" >
          <span className="iconfont toolIcons">&#xe635;</span>
          <div className="txt"></div>
        </button>

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

        <button className="singleTool" >
          <span className="iconfont toolIcons">&#xe7cd;</span>
          <div className="txt">剪裁</div>
        </button>
        <button className="uploadTool" >
          <div className="txt">上传</div>
          <input type="file" style={{ display: "none" }} webkitdirectory="true" />
        </button>
      </div>

      <div className="p-detail">
        <div className="p-picList">
          <div className="showPic">
            {
            }
          </div>
        </div>

        <div className="detailPicBox">
          <div className="detailPic" onContextMenu={() => false} onMouseDown={() => false} ></div>
        </div>
      </div>
    </div>
  );
}
