import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

function metaDataProvider(type, imageId) {
    var parsedImageId = cornerstoneWADOImageLoader.wadouri.parseImageId(imageId);
    // cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get 这里就是被改写后的获取，若是不改写，源码是获取不到我们加入的 DataSet 内容
    // 原因在于 源码每次返回的都是一个新对象，且 loadedDataSets 是不暴露的
    var dataSet = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(parsedImageId.url);
    if (!dataSet) {
        return;
    } 

    if (type === 'generalSeriesModule') {
        return {
            modality: dataSet.string('x00080060'),
            seriesInstanceUID: dataSet.string('x0020000e'),
            seriesNumber: dataSet.intString('x00200011'),
            studyInstanceUID: dataSet.string('x0020000d'),
            seriesDate: dicomParser.parseDA(dataSet.string('x00080021')),
            seriesTime: dicomParser.parseTM(dataSet.string('x00080031') || '')
        };
    }

    if (type === 'patientStudyModule') {
        return {
            patientAge: dataSet.intString('x00101010'),
            patientSize: dataSet.floatString('x00101020'),
            patientWeight: dataSet.floatString('x00101030')
        };
    }

    if (type === 'imagePlaneModule') {
        var imageOrientationPatient = cornerstoneWADOImageLoader.wadouri.metaData.getNumberValues(dataSet, 'x00200037', 6);
        var imagePositionPatient = cornerstoneWADOImageLoader.wadouri.metaData.getNumberValues(dataSet, 'x00200032', 3);
        var pixelSpacing = cornerstoneWADOImageLoader.wadouri.metaData.getNumberValues(dataSet, 'x00280030', 2);
        var columnPixelSpacing = null;
        var rowPixelSpacing = null;

        if (pixelSpacing) {
            rowPixelSpacing = pixelSpacing[0];
            columnPixelSpacing = pixelSpacing[1];
        }

        var rowCosines = null;
        var columnCosines = null;

        if (imageOrientationPatient) {
            rowCosines = [parseFloat(imageOrientationPatient[0]), parseFloat(imageOrientationPatient[1]), parseFloat(imageOrientationPatient[2])];
            columnCosines = [parseFloat(imageOrientationPatient[3]), parseFloat(imageOrientationPatient[4]), parseFloat(imageOrientationPatient[5])];
        }

        return {
            frameOfReferenceUID: dataSet.string('x00200052'),
            rows: dataSet.uint16('x00280010'),
            columns: dataSet.uint16('x00280011'),
            imageOrientationPatient: imageOrientationPatient,
            rowCosines: rowCosines,
            columnCosines: columnCosines,
            imagePositionPatient: imagePositionPatient,
            sliceThickness: dataSet.floatString('x00180050'),
            sliceLocation: dataSet.floatString('x00201041'),
            pixelSpacing: pixelSpacing,
            rowPixelSpacing: rowPixelSpacing,
            columnPixelSpacing: columnPixelSpacing
        };
    }

    if (type === 'imagePixelModule') {
        return cornerstoneWADOImageLoader.wadouri.metaData.getImagePixelModule(dataSet);
    }

    if (type === 'modalityLutModule') {
        return {
            rescaleIntercept: dataSet.floatString('x00281052'),
            rescaleSlope: dataSet.floatString('x00281053'),
            rescaleType: dataSet.string('x00281054'),
            modalityLUTSequence: cornerstoneWADOImageLoader.wadouri.metaData.getLUTs(dataSet.uint16('x00280103'), dataSet.elements.x00283000)
        };
    }

    if (type === 'voiLutModule') {
        var modalityLUTOutputPixelRepresentation = cornerstoneWADOImageLoader.wadouri.metaData.getModalityLUTOutputPixelRepresentation(dataSet);
        return {
            windowCenter: cornerstoneWADOImageLoader.wadouri.metaData.getNumberValues(dataSet, 'x00281050', 1),
            windowWidth: cornerstoneWADOImageLoader.wadouri.metaData.getNumberValues(dataSet, 'x00281051', 1),
            voiLUTSequence: cornerstoneWADOImageLoader.wadouri.metaData.getLUTs(modalityLUTOutputPixelRepresentation, dataSet.elements.x00283010)
        };
    }

    if (type === 'sopCommonModule') {
        return {
            sopClassUID: dataSet.string('x00080016'),
            sopInstanceUID: dataSet.string('x00080018')
        };
    }

    if (type === 'petIsotopeModule') {
        var radiopharmaceuticalInfo = dataSet.elements.x00540016;

        if (radiopharmaceuticalInfo === undefined) {
            return;
        }

        var firstRadiopharmaceuticalInfoDataSet = radiopharmaceuticalInfo.items[0].dataSet;
        return {
            radiopharmaceuticalInfo: {
                radiopharmaceuticalStartTime: dicomParser.parseTM(firstRadiopharmaceuticalInfoDataSet.string('x00181072') || ''),
                radionuclideTotalDose: firstRadiopharmaceuticalInfoDataSet.floatString('x00181074'),
                radionuclideHalfLife: firstRadiopharmaceuticalInfoDataSet.floatString('x00181075')
            }
        };
    }

    if (type === 'overlayPlaneModule') {
        return getOverlayPlaneModule(dataSet);
    }
}

function getOverlayPlaneModule(dataSet) {
    var overlays = [];
    for (var overlayGroup = 0x00; overlayGroup <= 0x1e; overlayGroup += 0x02) {
        var groupStr = "x60".concat(overlayGroup.toString(16));
        if (groupStr.length === 4) {
            groupStr = "x600".concat(overlayGroup.toString(16));
        }
        var data = dataSet.elements["".concat(groupStr, "3000")];
        if (!data) {
            continue;
        }
        var pixelData = [];
        for (var i = 0; i < data.length; i++) {
            for (var k = 0; k < 8; k++) {
                var byte_as_int = dataSet.byteArray[data.dataOffset + i];
                pixelData[i * 8 + k] = byte_as_int >> k & 1; // eslint-disable-line no-bitwise
            }
        }
        overlays.push({
            rows: dataSet.uint16("".concat(groupStr, "0010")),
            columns: dataSet.uint16("".concat(groupStr, "0011")),
            type: dataSet.string("".concat(groupStr, "0040")),
            x: dataSet.int16("".concat(groupStr, "0050"), 1) - 1,
            y: dataSet.int16("".concat(groupStr, "0050"), 0) - 1,
            pixelData: pixelData,
            description: dataSet.string("".concat(groupStr, "0022")),
            label: dataSet.string("".concat(groupStr, "1500")),
            roiArea: dataSet.string("".concat(groupStr, "1301")),
            roiMean: dataSet.string("".concat(groupStr, "1302")),
            roiStandardDeviation: dataSet.string("".concat(groupStr, "1303"))
        });
    }
    return {
        overlays: overlays
    };
}

export default metaDataProvider;