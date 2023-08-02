import axios from "axios";
import { message } from "antd";

// 10.19.0.26:51010
const BASEURL = process.env.NODE_ENV === 'dev' ? '/api' : 'http://49.232.238.116:8001/MedicalSystem';

const instance = axios.create({
  baseURL: BASEURL,
  // withCredentials: true,
  // timeout: 100000,
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
    if (err.response && err.response.status) {
      handleNetError(err.response.status);
      Promise.reject(err.response);
    }
  }
);

export const Get = (url, params, responseType) => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'get',
      url,
      params,
      responseType
    }).then((result) => {
      resolve(result);
    })
      .catch((err) => {
        reject(err);
      });
  })
};

export const Post = (url, data, params, headers) => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'post',
      url,
      data,
      params,
      headers
    }).then(
      (data) => {
        resolve(data)
      }),
      (err) => {
        reject(err)
      }
  })
};

