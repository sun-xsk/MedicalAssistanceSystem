

import './Detail.scss'

export default function Detail(props) {
    const { index } = props

    return (
        <div className="detail-box"  >
            <div className="detail-bar">
                <span className='tag0'>  <span className="iconfont downIcon" >&#xe63c;</span> </span>
                <span className='tag1'>1</span>
                <span className='tag2'>1</span>
                <span className='tag3'>123</span>
                <span className='tag4'>234 HU</span>
            </div>
            <div className="detail-inner">
                <div className='inner1'>
                    结点 ID:
                    <div className='in'>
                        <span className="iconfont inIcon" >&#xe889;</span>
                    </div>
                    <div className='detail-inner-inputId'> 123</div>
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