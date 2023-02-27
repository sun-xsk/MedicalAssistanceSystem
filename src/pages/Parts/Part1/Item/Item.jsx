import React, { useRef, useEffect } from "react";
import {
    cornerstone,
  } from "../../../../util/js/cornerstone";

export default function Item(props){
    const {data} = props
    const itemRef = useRef(null)
    useEffect(()=>{
      cornerstone.enable(itemRef.current)
      cornerstone.loadImage(data).then((img)=>{
        cornerstone.displayImage(itemRef.current,img)
      })
    })
    return (
        <div className="pic" ref={itemRef} >

        </div>
    )
}