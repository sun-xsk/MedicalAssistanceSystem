/**
 * 
 * @param {string} number 
 * @returns {string}
 */
export const numberToTime = (number) => {
  return number.slice(0, 4) + "年" + number.slice(4, 6) + "月" + number.slice(6) + "日";
}