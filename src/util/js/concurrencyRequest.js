import { uploadFile } from '@/util/api'

export function concurrencyRequest(requests, maxNum, setState, handleFunction, ...args) {
  return new Promise(async (resolve) => {
    if (requests.length === 0) {
      resolve([]);
    }

    let pool = [];
    let max = Math.min(maxNum, requests.length);
    const res = [];
    let count = 0;

    for (let i = 0; i < requests.length; i++) {
      let task = handleFunction(requests[i], ...args);
      task.then(() => {
        pool.splice(pool.indexOf(task), 1)
        count++;
        setState(count);
      })
      pool.push(task);
      if (pool.length === max || (i > max && pool.length === requests.length % max)) {
        const result = await Promise.all(pool);
        res.push(...result);
      }
      if (i === requests.length - 1) {
        resolve(res);
      }
    }
  })
}



