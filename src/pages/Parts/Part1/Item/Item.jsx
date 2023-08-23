import React, { useRef, useEffect } from "react";
import {
  cornerstone,
  cornerstoneTools
} from "@/util/js/cornerstone";

export default function Item(props) {
  const { data, ele, curIndex } = props;
  const index = Number(data.split(':')[1]);
  const itemRef = useRef(null)
  useEffect(() => {
    cornerstone.enable(itemRef.current)
    cornerstone.loadImage(data).then((img) => {
      cornerstone.displayImage(itemRef.current, img)
    })
  }, [])

  const scrollToIndex =
    cornerstoneTools.importInternal("util/scrollToIndex");

  const isThisIndex = curIndex === index;

  return (
    <div title="点击可跳转对应切片" onClick={() => {
      ele && scrollToIndex(ele, index);
    }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ border: isThisIndex ? 'gold solid 1px' : '#00a4d9 solid 1px', marginTop: 30, borderRadius: 5 }} ref={itemRef} >

      </div>
      <div style={{ color: "white" }}>第{Number(index) + 1}页</div>
    </div>
  )
}