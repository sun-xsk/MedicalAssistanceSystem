import { LoadingOutlined } from '@ant-design/icons'
import styles from './index.module.css';

export const MessageCom = (props) => {
  const { currentCount, totalCount, isShow, isUploadFile } = props;
  return (
    <div
      style={{ display: isShow ? 'block' : 'none', color: 'black' }}
      className={styles.message}
    >
      <LoadingOutlined style={{ color: '#1677ff', marginRight: '5px' }} />
      {isUploadFile ? '上传中' : '获取镜像中'}，耐心等待~ {currentCount}/{totalCount}
    </div>
  )
}