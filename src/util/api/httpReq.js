import axios from "axios";
import { message } from "antd";

const instance = axios.create({
  baseURL: "http://43.142.168.114:8001/MedicalSystem",
  withCredentials: true,
  timeout: 100000,
});

const handleNetError = (errStatus) => {
  let errMessage = "未知错误";
  if (errStatus) {
    switch (errStatus) {
      case 400:
        errMessage = "错误的请求";
        break;
      case 401:
        errMessage = "未授权，请重新登录";
        break;
      case 403:
        errMessage = "拒绝访问";
        break;
      case 404:
        errMessage = "请求错误,未找到该资源";
        break;
      case 405:
        errMessage = "请求方法未允许";
        break;
      case 408:
        errMessage = "请求超时";
        break;
      case 500:
        errMessage = "服务器端出错";
        break;
      case 501:
        errMessage = "网络未实现";
        break;
      case 502:
        errMessage = "网络错误";
        break;
      case 503:
        errMessage = "服务不可用";
        break;
      case 504:
        errMessage = "网络超时";
        break;
      case 505:
        errMessage = "http版本不支持该请求";
        break;
      default:
        errMessage = `其他连接错误 --${errStatus}`;
    }
  } else {
    errMessage = `无法连接到服务器！`;
  }

  message.error(errMessage);
};

instance.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    handleNetError(err.response.status);
    Promise.reject(err.response);
  }
);

export const Get = (url) => {
  return new Promise((resolve, reject) => {
    instance.get(url).then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  })
};

export const Post = (url, data, params, headers) => {
    return new Promise((resolve,reject)=>{
        instance({
            method:'post',
            url,
            data,
            params,
            headers
        }).then(
            (data)=>{
                resolve(data)
            }),
            (err)=>{
                reject(err)
            }
    })
};

// // 封装axios方法，并导出httpReq为新的请求工具
// export const httpReq = (method, url, data, headerMsg) => {
//   return new Promise((resolve, reject) => {
//     instance({
//       method: method,
//       url: url,
//       data: data,
//       headers: { ...headerMsg },
//     }).then(
//       (data) => {
//         resolve(data)
//       },
//       (err) => {

//         const status = err.response.status
//         const errInfo = err.response.data.message || status

//         reject({ status, errInfo })

//         switch (status) {
//           case 400:
//             message.error(`User are not login: ${errInfo}`)
//             break
//           case 401:
//             setTimeout(() => {
//               window.location.href = '/'
//             }, 1000)
//             break
//           case 404:
//             message.error(`Failed to find the resource: ${errInfo}`)
//             break
//           case 500:
//             message.warning(`The server failed to process the request !`)
//             break
//           case 504:
//             message.error("Request timeout, please request again")
//             break;
//           default:
//             message.error(`Wrong message: ${errInfo}`)
//             break
//         }
//       }
//     )
//   })
// }
