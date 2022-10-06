"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBreakpointImages = exports.generateThumbnail = exports.optimize = exports.generateName = exports.generateBreakpoint = exports.canBeProcessed = exports.allowedFormats = exports.breakpointSmallerThan = exports.resizeTo = exports.THUMBNAIL_RESIZE_OPTIONS = exports.getDimensions = exports.getMetaData = exports.bytesToKBytes = void 0;
const sharp_1 = __importDefault(require("sharp"));
const helpers_1 = require("@poppinss/utils/build/helpers");
const lodash_1 = require("lodash");
const decorator_1 = require("../Attachment/decorator");
const getMergedOptions = function (options) {
    return (0, lodash_1.merge)({
        preComputeUrls: false,
        breakpoints: decorator_1.DEFAULT_BREAKPOINTS,
        forceFormat: undefined,
        optimizeOrientation: true,
        optimizeSize: true,
        responsiveDimensions: true,
        disableThumbnail: false,
    }, options);
};
const bytesToKBytes = (bytes) => Math.round((bytes / 1000) * 100) / 100;
exports.bytesToKBytes = bytesToKBytes;
const getMetaData = async (buffer) => await (0, sharp_1.default)(buffer).metadata();
exports.getMetaData = getMetaData;
const getDimensions = async function (buffer) {
    return await (0, exports.getMetaData)(buffer).then(({ width, height }) => ({ width, height }));
};
exports.getDimensions = getDimensions;
/**
 * Default thumbnail resize options
 */
exports.THUMBNAIL_RESIZE_OPTIONS = {
    width: 245,
    height: 156,
    fit: 'inside',
};
const resizeTo = async function (buffer, options, resizeOptions) {
    const sharpInstance = options?.forceFormat
        ? (0, sharp_1.default)(buffer).toFormat(options.forceFormat)
        : (0, sharp_1.default)(buffer);
    return await sharpInstance
        .withMetadata()
        .resize(resizeOptions)
        .toBuffer()
        .catch(() => null);
};
exports.resizeTo = resizeTo;
const breakpointSmallerThan = (breakpoint, { width, height }) => breakpoint < width || breakpoint < height;
exports.breakpointSmallerThan = breakpointSmallerThan;
exports.allowedFormats = [
    'jpeg',
    'png',
    'webp',
    'avif',
    'tiff',
];
const canBeProcessed = async (buffer) => {
    const { format } = await (0, exports.getMetaData)(buffer);
    return format && exports.allowedFormats.includes(format);
};
exports.canBeProcessed = canBeProcessed;
const getImageExtension = function (imageFormat) {
    return imageFormat === 'jpeg' ? 'jpg' : imageFormat;
};
const generateBreakpoint = async ({ key, imageData, breakpoint, options, }) => {
    const breakpointBuffer = await (0, exports.resizeTo)(imageData.buffer, options, {
        width: breakpoint,
        height: breakpoint,
        fit: 'inside',
    });
    if (breakpointBuffer) {
        const { width, height, size, format } = await (0, exports.getMetaData)(breakpointBuffer);
        const extname = getImageExtension(format);
        const breakpointFileName = (0, exports.generateName)({
            extname,
            hash: imageData.hash,
            options,
            prefix: key,
        });
        return {
            key: key,
            file: {
                name: breakpointFileName,
                hash: imageData.hash,
                extname,
                mimeType: `image/${format}`,
                format: format,
                width: width,
                height: height,
                size: (0, exports.bytesToKBytes)(size),
                buffer: breakpointBuffer,
            },
        };
    }
    else {
        return null;
    }
};
exports.generateBreakpoint = generateBreakpoint;
/**
 * Generates the name for the attachment and prefixes
 * the folder (if defined)
 * @param payload
 * @param payload.extname The extension name for the image
 * @param payload.hash Hash string to use instead of a CUID
 * @param payload.prefix String to prepend to the filename
 * @param payload.options Attachment options
 */
const generateName = function ({ extname, hash, prefix, options, }) {
    return `${options?.folder ? `${options.folder}/` : ''}${prefix ? prefix + '_' : ''}${hash ? hash : (0, helpers_1.cuid)()}.${extname}`;
};
exports.generateName = generateName;
const optimize = async function (buffer, options) {
    const { optimizeOrientation, optimizeSize, forceFormat } = options || {};
    // Check if the image is in the right format or can be size optimised
    if (!optimizeSize || !(await (0, exports.canBeProcessed)(buffer))) {
        return { buffer };
    }
    // Auto rotate the image if `optimizeOrientation` is true
    let sharpInstance = optimizeOrientation ? (0, sharp_1.default)(buffer).rotate() : (0, sharp_1.default)(buffer);
    // Force image to output to a specific format if `forceFormat` is true
    sharpInstance = forceFormat ? sharpInstance.toFormat(forceFormat) : sharpInstance;
    return await sharpInstance
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
        // The original buffer should not be smaller than the optimised buffer
        const outputBuffer = buffer.length < data.length ? buffer : data;
        return {
            buffer: outputBuffer,
            info: {
                width: info.width,
                height: info.height,
                size: (0, exports.bytesToKBytes)(outputBuffer.length),
                format: info.format,
                mimeType: `image/${info.format}`,
                extname: getImageExtension(info.format),
            },
        };
    })
        .catch(() => ({ buffer }));
};
exports.optimize = optimize;
const generateThumbnail = async function (imageData, options) {
    options = getMergedOptions(options);
    if (!(await (0, exports.canBeProcessed)(imageData.buffer))) {
        return null;
    }
    if (!options?.responsiveDimensions || options?.disableThumbnail) {
        return null;
    }
    const { width, height } = await (0, exports.getDimensions)(imageData.buffer);
    if (!width || !height)
        return null;
    if (width > exports.THUMBNAIL_RESIZE_OPTIONS.width || height > exports.THUMBNAIL_RESIZE_OPTIONS.height) {
        const thumbnailBuffer = await (0, exports.resizeTo)(imageData.buffer, options, exports.THUMBNAIL_RESIZE_OPTIONS);
        if (thumbnailBuffer) {
            const { width: thumbnailWidth, height: thumbnailHeight, size, format, } = await (0, exports.getMetaData)(thumbnailBuffer);
            const extname = getImageExtension(format);
            const thumbnailFileName = (0, exports.generateName)({
                extname,
                hash: imageData.hash,
                options,
                prefix: 'thumbnail',
            });
            return {
                name: thumbnailFileName,
                hash: imageData.hash,
                extname,
                mimeType: `image/${format}`,
                format: format,
                width: thumbnailWidth,
                height: thumbnailHeight,
                size: (0, exports.bytesToKBytes)(size),
                buffer: thumbnailBuffer,
            };
        }
    }
    return null;
};
exports.generateThumbnail = generateThumbnail;
const generateBreakpointImages = async function (imageData, options) {
    options = getMergedOptions(options);
    /**
     * Noop if `responsiveDimensions` is falsy
     */
    if (!options.responsiveDimensions)
        return [];
    /**
     * Noop if image format is not allowed
     */
    if (!(await (0, exports.canBeProcessed)(imageData.buffer))) {
        return [];
    }
    const originalDimensions = await (0, exports.getDimensions)(imageData.buffer);
    const activeBreakpoints = (0, lodash_1.pickBy)(options.breakpoints, (value) => {
        return value !== 'off';
    });
    if ((0, lodash_1.isEmpty)(activeBreakpoints))
        return [];
    return Promise.all(Object.keys(activeBreakpoints).map((key) => {
        const breakpointValue = options.breakpoints?.[key];
        const isBreakpointSmallerThanOriginal = (0, exports.breakpointSmallerThan)(breakpointValue, originalDimensions);
        if (isBreakpointSmallerThanOriginal) {
            return (0, exports.generateBreakpoint)({ key, imageData, breakpoint: breakpointValue, options });
        }
    }));
};
exports.generateBreakpointImages = generateBreakpointImages;
