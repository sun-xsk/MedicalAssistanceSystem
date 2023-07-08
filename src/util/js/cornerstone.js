import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import cornerstoneTools from "cornerstone-tools";
import cornerstoneMath from "cornerstone-math"
import Hammer from "hammerjs";


cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.external.Hammer = Hammer
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

cornerstoneTools.init()

export {
    cornerstone,
    cornerstoneWADOImageLoader,
    dicomParser,
    cornerstoneTools,
}