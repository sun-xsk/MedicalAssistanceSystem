import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Image } from "antd";
import { MenuFoldOutlined } from "@ant-design/icons";

import svg from "../../../assets/back.svg";
import "./Part1.scss";

export function Part1() {
  const testPicList = ["1", "2", "3", "4", "5", "1", "2", "3", "4", "5"];

  return (
    <div className="Part1">
      <div className="p-header">
        <Link to="/home" className="back-home">
          <Image height={17} src={svg} preview={false} />
          <div className="txt">
            This is a line of statements used for placeholder
          </div>
        </Link>
      </div>
      <div className="toolBar">
      <div className="singleTool">
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
        </div>
      </div>

      <div className="p-detail">
        <div className="p-picList">
          <div className="showPic">
            {testPicList.map((item) => {
              return <div className="pic" key={item}></div>;
            })}
          </div>
        </div>
        <div className="detailPic"></div>
      </div>
    </div>
  );
}
