import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import cornerstoneTools from "cornerstone-tools";
import cornerstoneMath from "cornerstone-math"
import Hammer from "hammerjs";
import getImagePixelModule from './getImagePixelModule'
import metaDataProvider from './meteDataProvider'
import extend from './extend'

cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.external.Hammer = Hammer
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

cornerstoneTools.init()
// const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool
// cornerstoneTools.addTool(StackScrollMouseWheelTool)
// cornerstoneTools.setToolActive('StackScrollMouseWheel', {})


export { cornerstone, cornerstoneWADOImageLoader, dicomParser, cornerstoneTools, getImagePixelModule, metaDataProvider, extend }