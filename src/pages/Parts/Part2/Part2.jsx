import React, { useState } from "react";

import Header from "../Header/header";
import "./Part2.scss";

export function Part2() {
  return (
    <div className="Part2">
      <Header />
      <div className="toolBar">
        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe635;</span>
          <div className="txt"></div>
        </button>

        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe63a;</span>
          <div className="txt">去噪</div>
        </button>

        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe654;</span>
          <div className="txt">增强</div>
        </button>

        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe605;</span>
          <div className="txt">左右翻转</div>
        </button>

        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe606;</span>
          <div className="txt">上下翻转</div>
        </button>

        <button className="singleTool">
          <span className="iconfont toolIcons">&#xe7cd;</span>
          <div className="txt">剪裁</div>
        </button>
        
        <button className="uploadTool">
          <div className="txt">上传</div>
          <input
            type="file"
            style={{ display: "none" }}
            webkitdirectory="true"
          />
        </button>
      </div>

      <div className="p-detail">
        {/* 展示左边图片列表 */}
        <div className="p-picList">
          <div className="showPic">
            {/* {ids.map((item) => {
              return <div className="pic" key={item}></div>;
            })} */}
          </div>
        </div>

        {/* 展示具体大图 */}
        <div className="detailPicBox">
          <div
            className="detailPic"
            onContextMenu={() => false}
            onMouseDown={() => false}
          ></div>
        </div>
      </div>
    </div>
  );
}
