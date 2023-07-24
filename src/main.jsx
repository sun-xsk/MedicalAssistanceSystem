import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import 'antd/dist/antd.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </HashRouter>
)
