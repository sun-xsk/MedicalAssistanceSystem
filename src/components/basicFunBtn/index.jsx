import './index.scss'

/**
 * 
 * @param {{string, string, React.MouseEventHandler<HTMLButtonElement>}} props
 * @returns JSX
 */
export const BasicFunBtn = ({ title, iconCode, onClick }) => {
  return (
    <button
      className="singleTool"
      onClick={onClick}
    >
      <span className="iconfont toolIcons">{iconCode}</span>
      <div className="txt">{title}</div>
    </button>
  )
}