const { createProxyMiddleware } = require("http-proxy-middleware")
module.exports = (app) => {
    app.use(
        createProxyMiddleware(
            "/api", {
            target: "http://43.142.168.114:8001/",
            changeOrigin: true,
            secure: false, 
            pathRewrite: {
                '^/api': ''
            }
        })
    )
}

