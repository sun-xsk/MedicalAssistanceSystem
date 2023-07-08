import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

let loadedDataSets = {};

function extend() {
    // 存储对应的 url
    const dataSetCacheManager = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager;
    let getCache = dataSetCacheManager.get; // 源码中的获取 dataset方法
    // 你不重写，那么就自能改源码，否则实现不了，改源码只要添加个 add方法，就不会有重写那么多代码。
    cornerstoneWADOImageLoader.wadouri.dataSetCacheManager = {
        ...dataSetCacheManager, 
        get(uri) { // 这个是最重要的
            if (loadedDataSets[uri]) return loadedDataSets[uri].dataSet;
            return getCache(uri); // 返回 DataSet
        },
        add(uri, dataSet) {
            if (!loadedDataSets[uri]) {
                loadedDataSets[uri] = {};
            }
            loadedDataSets[uri].dataSet = dataSet;
        }
    }
}

export default extend
