import { Link } from "react-router-dom";
import { Image } from "antd";

import svg from "../../../../assets/back.svg";


export default function Header() {

  return (
    <>
      <div className="p-header">
        <Link to="/home" className="back-home">
          <Image height={17} src={svg} preview={false} />
          <div className="txt">
            医学图像预处理工具软件
          </div>
        </Link>
      </div>
    </>
  )
}