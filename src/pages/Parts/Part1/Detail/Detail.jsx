

import React, { useEffect, useRef, useState } from 'react'
import {
    cornerstoneTools,
} from "@/util/js";
import { message } from 'antd'
import './Detail.scss'

export default function Detail(props) {
    const { element } = props;
    const scrollToIndex =
        cornerstoneTools.importInternal("util/scrollToIndex");
    const { detail, index, setAnnotation, imageId, toolName: Tool, keyIndex } = props;
    const curIndex = Number(imageId.split(':')[1]);
    const { toolName } = detail;
    const tagName = detail.tagName || ' ';
    const [open, setOpen] = useState(false)
    const nameRef = useRef(null)

    const [showName, setShowName] = useState(tagName)

    const getValue = (tooName) => {
        if (tooName === "Angle") {
            return `${detail.rAngle}°`;
        }
        if (toolName === "CircleRoi" || toolName === "RectangleRoi") {
            return `${detail.cachedStats.area.toFixed(2)}mm²`;
        }
        if (toolName === "Length") {
            return `${parseFloat(detail.length).toFixed(2)}mm`;
        }
        if (toolName === "FreehandRoi") {
            return `${parseFloat(detail.area).toFixed(2)}mm²`;
        }
    }

    const saveName = () => {
        const name = nameRef.current.value;
        if (name.trim() === '') return;
        setAnnotation(e => {
            e[imageId][Tool].data[Number(index)].tagName = name;
            return e;
        })
        setShowName(name);
        message.success('保存成功');
    }

    const deleteName = () => {
        setShowName(' ');
        setAnnotation(e => {
            e[imageId][Tool].data[Number(index)].tagName = ' ';
            return e;
        })
        message.success('删除成功');
    }

    return <div className="detail-box" >
        <div className="detail-bar" title='单击可以跳转对应切片' onClick={() => {
            element && scrollToIndex(element, curIndex);
        }}>
            <span className={open ? 'tag0' : 'tag0d'} onClick={() => {
                setOpen(e => !e);
            }}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
            <span className='tag1'>{keyIndex + 1}</span>
            <span className='tag2'
                style={{
                    color: showName === ' ' ? 'gray' : '#00a4cc',
                    cursor: showName === ' ' ? 'pointer' : 'default'
                }}
                onClick={() => {
                    if (showName === ' ') {
                        setOpen(e => !e);
                    }
                }}
            >{showName === ' ' ? "待填写" : showName}</span>
            <span className='tag3'>{getValue(toolName)}</span>
        </div>
        <div className="detail-inner" style={{ display: open ? 'block' : 'none' }}>
            <div className='inner1'>
                标签名:
                <input className='detail-inner-tagName' placeholder='请输入' type="text" ref={nameRef} />
            </div>
            <div className='deleteBox'>
                <div onClick={saveName} className='detail-delete'>保存</div>
                <div onClick={deleteName} className='detail-delete'>删除</div>
            </div>
        </div>
    </div>
}