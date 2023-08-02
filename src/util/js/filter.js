export const filter = (files) => {
  const formDataArr = [];
  const resFiles = [];
  for (let i = 0, j = 0; i < files.length; i++) {
    if (i !== 0 && (i - j) % 5 === 0) j = i;
    if (i === j) {
      const formData = new FormData();
      resFiles.push([files[i]]);
      formData.append('files', files[i]);
      formDataArr.push(formData);
    } else {
      const index = Math.floor(i / 5);
      formDataArr[index].append('files', files[i]);
      resFiles[index].push(files[i]);
    }
  }
  return [formDataArr, resFiles];
}