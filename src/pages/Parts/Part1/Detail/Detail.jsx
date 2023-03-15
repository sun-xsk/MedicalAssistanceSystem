

import React,{ useEffect, useRef, useState } from 'react'
import './Detail.scss'

export default function Detail(props) {
    const { index } = props

    // const [open, setOpen] = useState(false)
    const openRef = useRef(null)
    const contentRef = useRef(null)

    useEffect(() => {
        let open = false;

        function opcl(e) {
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
        }
        openRef.current.addEventListener('click',opcl)
        return () => {
            // 在组件卸载时将事件解绑
            document.body.removeEventListener('click', opcl)
        }
    }, [])

    return (
        <div className="detail-box"  >
            <div className="detail-bar">
                <span className='tag0d' ref={openRef}>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                <span className='tag1'>1</span>
                <span className='tag2'>1</span>
                <span className='tag3'>123</span>
                <span className='tag4'>234 HU</span>
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