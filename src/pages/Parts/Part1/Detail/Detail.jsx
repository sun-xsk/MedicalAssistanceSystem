

import React, { useEffect, useRef, useState } from 'react'
import myStore from '../../../../util/store/store'
import { setLabelName, deleteLabeltoState } from '../../../../util/store/store'
import './Detail.scss'


export default function Detail(props) {
    const { detail, index } = props
    const { tagName, toolName } = detail
    let cachedStats, unit, area, length
    // const [open, setOpen] = useState(false)
    const openRef = useRef(null)
    const contentRef = useRef(null)
    const nameButtonRef = useRef(null)
    const deleteButtonRef = useRef(null)
    const nameRef = useRef(null)
    const indexRef = useRef(null)

    const [name, setName] = useState(tagName)

    useEffect(() => {
        let open = false;
        openRef.current.addEventListener('click', (e) => {
            e.preventDefault();

            if (open) {
                open = false
                openRef.current.className = "tag0d"
                contentRef.current.style.display = 'none'
            } else {
                open = true
                openRef.current.className = "tag0"
                contentRef.current.style.display = 'block'
            }
        })

        setName(myStore.getState().labelDetails[index]?.tagName)

        nameButtonRef.current.addEventListener('click', (e) => {
            e.preventDefault()
            myStore.dispatch(setLabelName({
                index,
                newName: nameRef.current.value
            }))
            alert("保存成功")
        })

        deleteButtonRef.current.addEventListener('click', (e) => {
            e.preventDefault()
            myStore.dispatch(deleteLabeltoState(indexRef.current.innerText - 1))
            alert("删除成功")
        })

    }, [])

    switch (toolName) {
        case "Angle":
            let { rAngle } = detail
            return (
                <div className="detail-box"  >
                    <div className="detail-bar">
                        <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                        <span className='tag1' ref={indexRef}>{index + 1}</span>
                        <span className='tag2'>{toolName}</span>
                        <span className='tag3'>{rAngle}°</span>
                    </div>
                    <div className="detail-inner" ref={contentRef}>
                        <div className='inner1'>
                            标签名:
                            <input className='detail-inner-tagName' placeholder={tagName} type="text" ref={nameRef} />
                        </div>
                        <div className='deleteBox'>
                            <input type="button" value="保存" className='detail-delete' ref={nameButtonRef} />
                            <input type="button" value="删除" className='detail-delete' ref={deleteButtonRef} />
                        </div>
                    </div>

                </div>
            )
        case "CircleRoi":
            cachedStats = detail.cachedStats
            unit = detail.unit
            area = cachedStats.area.toFixed(2)
            return (
                <div className="detail-box"  >
                    <div className="detail-bar">
                        <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                        <span className='tag1' ref={indexRef}>{index + 1}</span>
                        <span className='tag2'>{toolName}</span>
                        <span className='tag3'>{area} {unit}</span>
                    </div>
                    <div className="detail-inner" ref={contentRef}>
                        <div className='inner1'>
                            标签名:
                            <input className='detail-inner-tagName' placeholder={tagName} type="text" ref={nameRef} />
                        </div>
                        <div className='deleteBox'>
                            <input type="button" value="保存" className='detail-delete' ref={nameButtonRef} />
                            <input type="button" value="删除" className='detail-delete' ref={deleteButtonRef} />
                        </div>
                    </div>
                </div>
            )

        case "Length":
            length = parseFloat(detail.length).toFixed(2)
            unit = detail.unit
            return (
                <div className="detail-box"  >
                    <div className="detail-bar">
                        <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                        <span className='tag1' ref={indexRef}>{index + 1}</span>
                        <span className='tag2'>{toolName}</span>
                        <span className='tag3'>{length} {unit}</span>
                    </div>
                    <div className="detail-inner" ref={contentRef}>
                        <div className='inner1'>
                            标签名:
                            <input className='detail-inner-tagName' placeholder={tagName} type="text" ref={nameRef} />
                        </div>
                        <div className='deleteBox'>
                            <input type="button" value="保存" className='detail-delete' ref={nameButtonRef} />
                            <input type="button" value="删除" className='detail-delete' ref={deleteButtonRef} />
                        </div>
                    </div>
                </div>
            )

        case "FreehandRoi":
            unit = detail.unit
            area = parseFloat(detail.area).toFixed(2)
            return (
                <div className="detail-box"  >
                    <div className="detail-bar">
                        <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                        <span className='tag1' ref={indexRef}>{index + 1}</span>
                        <span className='tag2'>{toolName}</span>
                        <span className='tag3'>{area} {unit}</span>
                    </div>
                    <div className="detail-inner" ref={contentRef}>
                        <div className='inner1'>
                            标签名:
                            <input className='detail-inner-tagName' placeholder={tagName} type="text" ref={nameRef} />
                        </div>
                        <div className='deleteBox'>
                            <input type="button" value="保存" className='detail-delete' ref={nameButtonRef} />
                            <input type="button" value="删除" className='detail-delete' ref={deleteButtonRef} />
                        </div>
                    </div>
                </div>
            )

        case "RectangleRoi":
            cachedStats = detail.cachedStats
            unit = detail.unit
            area = cachedStats.area.toFixed(2)
            return (
                <div className="detail-box"  >
                    <div className="detail-bar">
                        <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                        <span className='tag1' ref={indexRef}>{index + 1}</span>
                        <span className='tag2'>{toolName}</span>
                        <span className='tag3'>{area} {unit}</span>
                    </div>
                    <div className="detail-inner" ref={contentRef}>
                        <div className='inner1'>
                            标签名:
                            <input className='detail-inner-tagName' placeholder={tagName} type="text" ref={nameRef} />
                        </div>
                        <div className='deleteBox'>
                            <input type="button" value="保存" className='detail-delete' ref={nameButtonRef} />
                            <input type="button" value="删除" className='detail-delete' ref={deleteButtonRef} />
                        </div>
                    </div>
                </div>
            )

        default:
            return (
                <div className="detail-box"  >
                    <div className="detail-bar">
                        <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                        <span className='tag1'>{index + 1}</span>
                        <span className='tag2'>{toolName}</span>
                        <span className='tag3'>default</span>
                        {/* <span className='tag4'>234 HU</span> */}
                    </div>
                    <div className="detail-inner" ref={contentRef}>
                        <div className='inner1'>
                            结点 ID:
                            <div className='in'>
                                <span className="iconfont inIcon" >&#xe889;</span>
                            </div>
                            <div className='detail-inner-inputId'>0</div>
                            <div className='de'>
                                <span className="iconfont deIcon" >&#xe64e;</span>
                            </div>
                        </div>
                        <div className='inner2'>
                            密度:
                            <span className='choose'>
                                <span className='content'>请选择</span>
                                <span className="iconfont downIcon" >&#xe63c;</span>
                            </span>
                        </div>
                        <div className='inner3'>
                            <span>
                                表征:
                                <span className='choose'>
                                    <span className='content'>请选择</span>
                                    <span className="iconfont downIcon" >&#xe63c;</span>
                                </span>
                            </span>
                        </div>
                        <div className='inner4'>
                            <span className='ex'>恶性程度:
                                <span className='choose'>
                                    <span className='content'>请选择</span>
                                    <span className="iconfont downIcon" >&#xe63c;</span>
                                </span>
                            </span>
                        </div>
                        <div className='inner5'>位置:
                            <span className='choose'>
                                <span className='content'>请选择</span>
                                <span className="iconfont downIcon" >&#xe63c;</span>
                            </span>
                        </div>
                    </div>

                </div>
            )
    }
}