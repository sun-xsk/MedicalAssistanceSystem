export function mergeToolState(preToolState, newToolState) {
  if (JSON.stringify(preToolState) === '{}') {
    return newToolState;
  }
  if (JSON.stringify(newToolState) === '{}') {
    return preToolState
  }
  const res = preToolState;

  for (const imageId in newToolState) {
    if (!res.hasOwnProperty(imageId)) {
      res[imageId] = newToolState[imageId];
      continue;
    }
    for (const toolName in newToolState[imageId]) {
      const tools = res[imageId];
      if (!tools.hasOwnProperty(toolName)) {
        res[imageId][toolName] = newToolState[imageId][toolName];
        continue;
      }
      const data = [...newToolState[imageId][toolName].data];
      for (const dataIndex in data) {
        const uuidArray = res[imageId][toolName].data.filter((item) => item.uuid === data[dataIndex].uuid);
        if (uuidArray.length === 0) {
          res[imageId][toolName].data.push(data[dataIndex])
        }
      }
    }
  }
  return res;
}