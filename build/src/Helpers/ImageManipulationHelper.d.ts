/// <reference types="node" />
import sharp from 'sharp';
import { AttachmentOptions, ImageBreakpoints, ImageInfo, OptimizedOutput, BreakpointFormat, FileDimensions } from '@ioc:Adonis/Addons/ResponsiveAttachment';
export declare const bytesToKBytes: (bytes: number) => number;
export declare const getMetaData: (buffer: Buffer) => Promise<sharp.Metadata>;
export declare const getDimensions: (buffer: Buffer) => Promise<FileDimensions>;
/**
 * Default thumbnail resize options
 */
export declare const THUMBNAIL_RESIZE_OPTIONS: {
    width: number;
    height: number;
    fit: "inside";
};
export declare const resizeTo: (buffer: Buffer, options: AttachmentOptions, resizeOptions: sharp.ResizeOptions) => Promise<Buffer | null>;
export declare const breakpointSmallerThan: (breakpoint: number, { width, height }: FileDimensions) => boolean;
export declare const allowedFormats: Array<AttachmentOptions['forceFormat']>;
export declare const canBeProcessed: (buffer: Buffer) => Promise<boolean | undefined>;
export declare const generateBreakpoint: ({ key, imageData, breakpoint, options, }: {
    key: keyof ImageBreakpoints | string;
    imageData: ImageInfo;
    breakpoint: number;
    options: AttachmentOptions;
}) => Promise<BreakpointFormat>;
/**
 * Generates the name for the attachment and prefixes
 * the folder (if defined)
 * @param payload
 * @param payload.extname The extension name for the image
 * @param payload.hash Hash string to use instead of a CUID
 * @param payload.prefix String to prepend to the filename
 * @param payload.options Attachment options
 */
export declare const generateName: ({ extname, hash, prefix, options, }: {
    extname?: string | undefined;
    hash?: string | undefined;
    prefix?: string | undefined;
    options?: AttachmentOptions | undefined;
}) => string;
export declare const optimize: (buffer: Buffer, options?: AttachmentOptions | undefined) => Promise<OptimizedOutput>;
export declare const generateThumbnail: (imageData: ImageInfo, options: AttachmentOptions) => Promise<ImageInfo | null>;
export declare const generateBreakpointImages: (imageData: ImageInfo, options: AttachmentOptions) => Promise<(BreakpointFormat | undefined)[]>;
