import axios from 'axios'
import { message } from 'antd'
const instance = axios.create({
  baseURL: 'http://43.142.168.114:8001/MedicalSystem',
  withCredentials: true,
  timeout:5000
})

// 添加返回拦截器，直接获取返回内容的data
instance.interceptors.response.use((res) => {
  return res.data
})
// 封装axios方法，并导出httpReq为新的请求工具
export const httpReq = (method, url, data, headerMsg) => {
  return new Promise((resolve, reject) => {
    instance({
      method: method,
      url: url,
      data: data,
      headers: { ...headerMsg }
    }).then(
      (data) => {
        resolve(data)
      },
      (err) => {

        const status = err.response.status
        const errInfo = err.response.data.message || status

        reject({ status, errInfo })
        
        switch (status) {
          case 400:
            message.error(`User are not login: ${errInfo}`)
            break
          case 401:
            setTimeout(() => {
              window.location.href = '/'
            }, 1000)
            break
          case 404:
            message.error(`Failed to find the resource: ${errInfo}`)
            break
          case 500:
            message.warning(`The server failed to process the request !`)
            break
          case 504:
            message.error("Request timeout, please request again")
            break;
          default:
            message.error(`Wrong message: ${errInfo}`)
            break
        }
      }
    )
  })
}
