"use strict";
/*
 * adonis-responsive-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi@furnish.ng>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveAttachment = exports.tempUploadFolder = void 0;
/// <reference path="../../adonis-typings/index.ts" />
const path_1 = require("path");
const utils_1 = require("@poppinss/utils");
const helpers_1 = require("@poppinss/utils/build/helpers");
const detect_file_type_1 = __importDefault(require("detect-file-type"));
const ImageManipulationHelper_1 = require("../Helpers/ImageManipulationHelper");
const lodash_1 = require("lodash");
const decorator_1 = require("./decorator");
exports.tempUploadFolder = 'image_upload_tmp';
/**
 * Attachment class represents an attachment data type
 * for Lucid models
 */
class ResponsiveAttachment {
    constructor(attributes, buffer) {
        this.buffer = buffer;
        /**
         * Find if the image has been persisted or not.
         */
        this.isPersisted = false;
        /**
         * "isLocal = true" means the instance is created locally
         * using the bodyparser file object
         */
        this.isLocal = !!this.path;
        this.name = attributes.name;
        this.size = attributes.size;
        this.hash = attributes.hash;
        this.width = attributes.width;
        this.format = attributes.format;
        this.height = attributes.height;
        this.extname = attributes.extname;
        this.mimeType = attributes.mimeType;
        this.url = attributes.url ?? undefined;
        this.breakpoints = attributes.breakpoints ?? undefined;
        this.fileName = attributes.fileName ?? '';
        this.path = attributes.path ?? '';
        this.isLocal = !!this.path || !!this.buffer;
        if (attributes.fileName) {
            this.relativePath = (0, path_1.join)(exports.tempUploadFolder, attributes.fileName);
        }
        else if (attributes.name) {
            this.relativePath = (0, path_1.join)(exports.tempUploadFolder, attributes.name);
        }
        else {
            this.relativePath = '';
        }
    }
    /**
     * Reference to the drive
     */
    static getDrive() {
        return this.drive;
    }
    /**
     * Set the drive instance
     */
    static setDrive(drive) {
        this.drive = drive;
    }
    /**
     * Create attachment instance from the bodyparser
     * file
     */
    static async fromFile(file) {
        if (!file) {
            throw new SyntaxError('You should provide a non-falsy value');
        }
        // Store the file locally first and add the path to the ImageInfo
        // This will be removed after the operation is completed
        await file.moveToDisk(exports.tempUploadFolder);
        if (ImageManipulationHelper_1.allowedFormats.includes(file?.subtype) === false) {
            throw new RangeError(`Uploaded file is not an allowable image. Make sure that you uploaded only the following format: "jpeg", "png", "webp", "tiff", and "avif".`);
        }
        const attributes = {
            extname: file.extname,
            mimeType: `${file.type}/${file.subtype}`,
            size: file.size,
            path: file.filePath,
            fileName: file.fileName?.replace(exports.tempUploadFolder, ''),
        };
        return new ResponsiveAttachment(attributes);
    }
    /**
     * Create attachment instance from the bodyparser via a buffer
     */
    static fromBuffer(buffer) {
        return new Promise((resolve, reject) => {
            try {
                let bufferProperty;
                detect_file_type_1.default.fromBuffer(buffer, function (err, result) {
                    if (err) {
                        throw new Error(err instanceof Error ? err.message : err);
                    }
                    if (!result) {
                        throw new utils_1.Exception('Please provide a valid file buffer');
                    }
                    bufferProperty = result;
                });
                const { mime, ext } = bufferProperty;
                const subtype = mime.split('/').pop();
                if (ImageManipulationHelper_1.allowedFormats.includes(subtype) === false) {
                    throw new RangeError(`Uploaded file is not an allowable image. Make sure that you uploaded only the following format: "jpeg", "png", "webp", "tiff", and "avif".`);
                }
                const attributes = {
                    extname: ext,
                    mimeType: mime,
                    size: buffer.length,
                };
                return resolve(new ResponsiveAttachment(attributes, buffer));
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    /**
     * Create attachment instance from the database response
     */
    static fromDbResponse(response) {
        const attributes = typeof response === 'string' ? JSON.parse(response) : response;
        if (!attributes)
            return null;
        const attachment = new ResponsiveAttachment(attributes);
        /**
         * Images fetched from DB are always persisted
         */
        attachment.isPersisted = true;
        return attachment;
    }
    get attributes() {
        return {
            name: this.name,
            size: this.size,
            hash: this.hash,
            width: this.width,
            format: this.format,
            height: this.height,
            extname: this.extname,
            mimeType: this.mimeType,
            url: this.url,
            breakpoints: this.breakpoints,
            path: this.path,
        };
    }
    /**
     * Returns disk instance
     */
    getDisk() {
        const disk = this.options?.disk;
        const Drive = this.constructor.getDrive();
        return disk ? Drive.use(disk) : Drive.use();
    }
    /**
     * Define persistance options
     */
    setOptions(options) {
        this.options = (0, lodash_1.merge)({
            preComputeUrls: false,
            keepOriginal: true,
            breakpoints: decorator_1.DEFAULT_BREAKPOINTS,
            forceFormat: undefined,
            optimizeOrientation: true,
            optimizeSize: true,
            responsiveDimensions: true,
        }, options);
        return this;
    }
    async enhanceFile() {
        // Read the image as a buffer using `Drive.get()`, normalizing the path
        const originalFileBuffer = this.buffer ?? (await this.getDisk().get((0, path_1.normalize)(this.relativePath)));
        // Optimise the image buffer and return the optimised buffer
        // and the info of the image
        const { buffer, info } = await (0, ImageManipulationHelper_1.optimize)(originalFileBuffer, this.options);
        // Override the `imageInfo` object with the optimised `info` object
        // As the optimised `info` object is preferred
        // Also append the `hash` and `buffer`
        return (0, lodash_1.assign)({ ...this.attributes }, info, { hash: (0, helpers_1.cuid)(), buffer });
    }
    /**
     * Save image to the disk. Results in noop when "this.isLocal = false"
     */
    async save() {
        /**
         * Do not persist already persisted image or if the
         * instance is not local
         */
        if (!this.isLocal || this.isPersisted) {
            return;
        }
        /**
         * Read the original temporary file from disk and optimise the file while
         * return the enhanced buffer and information of the enhanced buffer
         */
        const enhancedImageData = await this.enhanceFile();
        /**
         * Generate the name of the original image
         */
        this.name =
            this.options?.keepOriginal ?? true
                ? (0, ImageManipulationHelper_1.generateName)({
                    extname: enhancedImageData.extname,
                    hash: enhancedImageData.hash,
                    options: this.options,
                    prefix: 'original',
                })
                : undefined;
        /**
         * Update the local attributes with the attributes
         * of the optimised original file
         */
        if (this.options?.keepOriginal ?? true) {
            this.size = enhancedImageData.size;
            this.hash = enhancedImageData.hash;
            this.width = enhancedImageData.width;
            this.height = enhancedImageData.height;
            this.format = enhancedImageData.format;
            this.extname = enhancedImageData.extname;
            this.mimeType = enhancedImageData.mimeType;
        }
        /**
         * Inject the name into the `ImageInfo`
         */
        enhancedImageData.name = this.name;
        /**
         * Write the optimised original image to the disk
         */
        if (this.options?.keepOriginal ?? true) {
            await this.getDisk().put(enhancedImageData.name, enhancedImageData.buffer);
        }
        /**
         * Generate image thumbnail data
         */
        const thumbnailImageData = await (0, ImageManipulationHelper_1.generateThumbnail)(enhancedImageData, this.options);
        if (thumbnailImageData) {
            /**
             * Write the thumbnail image to the disk
             */
            await this.getDisk().put(thumbnailImageData.name, thumbnailImageData.buffer);
            /**
             * Delete buffer from `thumbnailImageData`
             */
            delete thumbnailImageData.buffer;
            (0, lodash_1.set)(enhancedImageData, 'breakpoints.thumbnail', thumbnailImageData);
        }
        /**
         * Generate breakpoint image data
         */
        const breakpointFormats = await (0, ImageManipulationHelper_1.generateBreakpointImages)(enhancedImageData, this.options);
        if (breakpointFormats && Array.isArray(breakpointFormats) && breakpointFormats.length > 0) {
            for (const format of breakpointFormats) {
                if (!format)
                    continue;
                const { key, file: breakpointImageData } = format;
                /**
                 * Write the breakpoint image to the disk
                 */
                await this.getDisk().put(breakpointImageData.name, breakpointImageData.buffer);
                /**
                 * Delete buffer from `breakpointImageData`
                 */
                delete breakpointImageData.buffer;
                (0, lodash_1.set)(enhancedImageData, ['breakpoints', key], breakpointImageData);
            }
        }
        const { width, height } = await (0, ImageManipulationHelper_1.getDimensions)(enhancedImageData.buffer);
        delete enhancedImageData.buffer;
        delete enhancedImageData.path;
        (0, lodash_1.assign)(enhancedImageData, {
            width,
            height,
        });
        /**
         * Update the width and height
         */
        if (this.options?.keepOriginal ?? true) {
            this.width = enhancedImageData.width;
            this.height = enhancedImageData.height;
        }
        /**
         * Update the local value of `breakpoints`
         */
        this.breakpoints = enhancedImageData.breakpoints;
        /**
         * Images has been persisted
         */
        this.isPersisted = true;
        /**
         * Delete the temporary file
         */
        if (this.buffer) {
            this.buffer = null;
        }
        else
            await this.getDisk().delete(this.relativePath);
        /**
         * Compute the URL
         */
        await this.computeUrls();
        return this;
    }
    /**
     * Delete original and responsive images from the disk
     */
    async delete() {
        if (!this.isPersisted) {
            return;
        }
        /**
         * Delete the original image
         */
        if (this.options?.keepOriginal ?? true)
            await this.getDisk().delete(this.name);
        /**
         * Delete the responsive images
         */
        if (this.breakpoints) {
            for (const key in this.breakpoints) {
                if (Object.prototype.hasOwnProperty.call(this.breakpoints, key)) {
                    const breakpointImage = this.breakpoints[key];
                    await this.getDisk().delete(breakpointImage.name);
                }
            }
        }
        this.isDeleted = true;
        this.isPersisted = false;
    }
    async computeUrls(signedUrlOptions) {
        /**
         * Cannot compute url for a non persisted image
         */
        if (!this.isPersisted) {
            return;
        }
        /**
         * Compute urls when preComputeUrls is set to true
         * or the `preComputeUrls` function exists
         */
        if (!this.options?.preComputeUrls) {
            return;
        }
        const disk = this.getDisk();
        /**
         * Generate url using the user defined preComputeUrls method
         */
        if (typeof this.options?.preComputeUrls === 'function') {
            const urls = await this.options.preComputeUrls(disk, this);
            this.url = urls.url;
            if (!this.urls)
                this.urls = {};
            if (!this.urls.breakpoints)
                this.urls.breakpoints = {};
            for (const key in urls.breakpoints) {
                if (Object.prototype.hasOwnProperty.call(urls.breakpoints, key)) {
                    if (!this.urls.breakpoints[key])
                        this.urls.breakpoints[key] = { url: '' };
                    this.urls.breakpoints[key].url = urls.breakpoints[key].url;
                }
            }
            return this.urls;
        }
        /**
         * Iterative URL-computation logic
         */
        const { path, ...originalAttributes } = this.attributes;
        const attachmentData = originalAttributes;
        if (attachmentData) {
            if (!this.urls)
                this.urls = {};
            for (const key in attachmentData) {
                if (['name', 'breakpoints'].includes(key) === false)
                    continue;
                const value = attachmentData[key];
                let url;
                if (key === 'name') {
                    if (!(this.options?.keepOriginal ?? true))
                        continue;
                    const name = value;
                    const imageVisibility = await disk.getVisibility(name);
                    if (imageVisibility === 'private') {
                        url = await disk.getSignedUrl(name, signedUrlOptions || undefined);
                    }
                    else {
                        url = await disk.getUrl(name);
                    }
                    this.urls['url'] = url;
                    this.url = url;
                }
                else if (key === 'breakpoints') {
                    if ((0, lodash_1.isEmpty)(value) !== true) {
                        if (!this.urls.breakpoints)
                            this.urls.breakpoints = {};
                        for (const breakpoint in value) {
                            if (Object.prototype.hasOwnProperty.call(value, breakpoint)) {
                                const breakpointImageData = value?.[breakpoint];
                                if (breakpointImageData) {
                                    const imageVisibility = await disk.getVisibility(breakpointImageData.name);
                                    if (imageVisibility === 'private') {
                                        url = await disk.getSignedUrl(breakpointImageData.name, signedUrlOptions || undefined);
                                    }
                                    else {
                                        url = await disk.getUrl(breakpointImageData.name);
                                    }
                                    this.urls['breakpoints'][breakpoint] = { url };
                                }
                            }
                        }
                    }
                }
            }
        }
        return this.urls;
    }
    /**
     * Returns the signed or unsigned URL for each responsive image
     */
    async getUrls(signingOptions) {
        return this.computeUrls({ ...signingOptions });
    }
    /**
     * Convert attachment instance to object without the `url` property
     * for persistence to the database
     */
    toObject() {
        const { path, url, ...originalAttributes } = this.attributes;
        return (0, lodash_1.merge)(this.options?.keepOriginal ?? true ? originalAttributes : {}, {
            breakpoints: this.breakpoints,
        });
    }
    /**
     * Serialize attachment instance to JSON object to be sent over the wire
     */
    toJSON() {
        return (0, lodash_1.merge)(this.toObject(), this.urls ? this.urls : {});
    }
}
exports.ResponsiveAttachment = ResponsiveAttachment;
