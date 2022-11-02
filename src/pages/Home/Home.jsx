import React from "react";
import { Link } from "react-router-dom";
import { Image } from "antd";

import Svg from "../../assets/Home.svg";
import "./Home.scss";

export default function Home() {
  return (
    <div className="Home">
      <div className="h-header">
        <div className="h-center">
          <Image height={80} src={Svg} className="h-h-svg" preview={false} />
          <div className="h-h-txt">
            This is a line of statements used for placeholder
          </div>
        </div>
      </div>
      <div className="h-content">
        <div className="h-c-center">
          <div className="h-c-left">
            <div className="top">Part1</div>
            <div className="content">
              <div className="Span">
                This is a sentance for explain.This is a sentance for
                explain.This is a sentance for explain.
              </div>
            </div>
            <Link to="/Part1" className="link">
              click here to use this tool &gt;
            </Link>
          </div>
          <div className="h-c-right">
            <div className="top">Part2</div>
            <div className="content">
              <div className="Span">
                This is a sentance for explain.This is a sentance for
                explain.This is a sentance for explain.
              </div>
            </div>
            <Link to="/Part2" className="link">
              click here to use this tool &gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
