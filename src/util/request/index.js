import axios from "axios";

const request=axios.create({
    baseURL:"http://43.142.168.114:8001/api/MedicalSystem",
    timeout:5000
})
export const connect=()=>{
    return request({
        method:"get",
        url:"/file/testConnect"
    })
}