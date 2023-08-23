import Detail from "../Detail/Detail";

export const DetailContainer = (props) => {
  const { toolState, setAnnotation, element } = props;
  const details = [];

  for (const imageId in toolState) {
    for (const toolName in toolState[imageId]) {
      const data = [...toolState[imageId][toolName].data];
      for (const dataIndex in data) {
        details.push({ imageId, toolName, data: data[dataIndex], index: dataIndex });
      }
    }
  }

  return <>
    {details.map((detail, index) =>
      <Detail
        detail={detail.data}
        imageId={detail.imageId}
        toolName={detail.toolName}
        index={detail.index}
        keyIndex={index}
        key={`key-${index}`}
        setAnnotation={setAnnotation}
        element={element}
      />
    )}
  </>
}