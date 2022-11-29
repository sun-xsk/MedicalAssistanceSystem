import { Link } from "react-router-dom";
import { Image } from "antd";

import svg from "../../../assets/back.svg";


export default function Header() {

  return (
    <>
      <div className="p-header">
        <Link to="/home" className="back-home">
          <Image height={17} src={svg} preview={false} />
          <div className="txt">
            This is a line of statements used for placeholder
          </div>
        </Link>
      </div>
    </>
  )
}