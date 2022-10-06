/// <reference path="../../adonis-typings/index.d.ts" />
/// <reference types="@adonisjs/drive/build/adonis-typings" />
/// <reference types="@adonisjs/bodyparser/build/adonis-typings" />
/// <reference types="node" />
import type { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import type { DriveManagerContract, ContentHeaders } from '@ioc:Adonis/Core/Drive';
import type { AttachmentOptions, ResponsiveAttachmentContract, AttachmentAttributes, ImageInfo, UrlRecords, ImageBreakpoints, ImageAttributes } from '@ioc:Adonis/Addons/ResponsiveAttachment';
export declare const tempUploadFolder = "image_upload_tmp";
/**
 * Attachment class represents an attachment data type
 * for Lucid models
 */
export declare class ResponsiveAttachment implements ResponsiveAttachmentContract {
    private buffer?;
    private static drive;
    /**
     * Reference to the drive
     */
    static getDrive(): DriveManagerContract;
    /**
     * Set the drive instance
     */
    static setDrive(drive: DriveManagerContract): void;
    /**
     * Create attachment instance from the bodyparser
     * file
     */
    static fromFile(file: MultipartFileContract): Promise<ResponsiveAttachmentContract>;
    /**
     * Create attachment instance from the bodyparser via a buffer
     */
    static fromBuffer(buffer: Buffer): Promise<ResponsiveAttachmentContract>;
    /**
     * Create attachment instance from the database response
     */
    static fromDbResponse(response: string | ImageAttributes): ResponsiveAttachment | null;
    /**
     * Attachment options
     */
    private options?;
    /**
     * The generated name of the original file.
     * Available only when "isPersisted" is true.
     */
    name?: string;
    /**
     * The generated url of the original file.
     * Available only when "isPersisted" is true.
     */
    url?: string;
    /**
     * The urls of the original and breakpoint files.
     * Available only when "isPersisted" is true.
     */
    urls?: UrlRecords;
    /**
     * The image size of the original file in bytes
     */
    size?: number;
    /**
     * The image extname. Inferred from the bodyparser file extname
     * property
     */
    extname?: string;
    /**
     * The image mimetype.
     */
    mimeType?: string;
    /**
     * The image hash.
     */
    hash?: string;
    /**
     * The image width.
     */
    width?: number;
    /**
     * The image height.
     */
    height?: number;
    /**
     * This file name.
     */
    fileName?: string;
    /**
     * The relative path from the disk.
     */
    relativePath?: string;
    /**
     * The absolute path of the original uploaded file
     * Available after initial move operation in the decorator
     */
    path?: string;
    /**
     * The format or filetype of the image.
     */
    format?: AttachmentOptions['forceFormat'];
    /**
     * The format or filetype of the image.
     */
    breakpoints?: Record<keyof ImageBreakpoints, ImageInfo>;
    /**
     * Find if the image has been persisted or not.
     */
    isPersisted: boolean;
    /**
     * Find if the image has been deleted or not
     */
    isDeleted: boolean;
    constructor(attributes: AttachmentAttributes & {
        fileName?: string;
    }, buffer?: Buffer | null | undefined);
    get attributes(): {
        name: string | undefined;
        size: number | undefined;
        hash: string | undefined;
        width: number | undefined;
        format: "jpeg" | "png" | "webp" | "avif" | "tiff" | undefined;
        height: number | undefined;
        extname: string | undefined;
        mimeType: string | undefined;
        url: string | undefined;
        breakpoints: Record<string, ImageInfo>;
        path: string;
    };
    /**
     * "isLocal = true" means the instance is created locally
     * using the bodyparser file object
     */
    isLocal: boolean;
    /**
     * Returns disk instance
     */
    private getDisk;
    /**
     * Define persistance options
     */
    setOptions(options?: AttachmentOptions): this;
    protected enhanceFile(): Promise<ImageInfo>;
    /**
     * Save image to the disk. Results in noop when "this.isLocal = false"
     */
    save(): Promise<this | undefined>;
    /**
     * Delete original and responsive images from the disk
     */
    delete(): Promise<void>;
    computeUrls(signedUrlOptions?: ContentHeaders & {
        expiresIn?: string | number;
    }): Promise<UrlRecords | undefined>;
    /**
     * Returns the signed or unsigned URL for each responsive image
     */
    getUrls(signingOptions?: ContentHeaders & {
        expiresIn?: string | number;
    }): Promise<UrlRecords | undefined>;
    /**
     * Convert attachment instance to object without the `url` property
     * for persistence to the database
     */
    toObject(): {
        breakpoints: Record<string, ImageInfo> | undefined;
    };
    /**
     * Serialize attachment instance to JSON object to be sent over the wire
     */
    toJSON(): {
        breakpoints: Record<string, ImageInfo> | undefined;
    } & UrlRecords;
}
