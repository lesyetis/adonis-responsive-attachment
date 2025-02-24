/// <reference types="@adonisjs/drive/build/adonis-typings" />
/// <reference types="@adonisjs/lucid" />
/// <reference types="@adonisjs/bodyparser/build/adonis-typings" />
/// <reference types="node" />
declare module '@ioc:Adonis/Addons/ResponsiveAttachment' {
    import { ColumnOptions } from '@ioc:Adonis/Lucid/Orm';
    import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
    import { DisksList, ContentHeaders, DriverContract, DriveManagerContract } from '@ioc:Adonis/Core/Drive';
    type Breakpoints = Partial<{
        large: number | 'off';
        medium: number | 'off';
        small: number | 'off';
    }> & Record<string, number | 'off'>;
    /**
     * Options used to persist the attachment to
     * the disk
     */
    type AttachmentOptions = {
        disk?: keyof DisksList;
        folder?: string;
        keepOriginal?: boolean;
        breakpoints?: Breakpoints;
        forceFormat?: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff';
        optimizeSize?: boolean;
        optimizeOrientation?: boolean;
        responsiveDimensions?: boolean;
        disableThumbnail?: boolean;
        preComputeUrls?: boolean | ((disk: DriverContract, attachment: ResponsiveAttachmentContract) => Promise<UrlRecords>);
    };
    interface ImageAttributes {
        /**
         * The name is available only when "isPersisted" is true.
         */
        name?: string;
        /**
         * The url is available only when "isPersisted" is true.
         */
        url?: string;
        /**
         * The file size in bytes
         */
        size?: number;
        /**
         * The file extname. Inferred from the BodyParser file extname
         * property
         */
        extname?: string;
        /**
         * The file mimetype.
         */
        mimeType?: string;
        /**
         * The hash string of the image
         */
        hash?: string;
        /**
         * The width of the image
         */
        width?: number;
        /**
         * The height of the image
         */
        height?: number;
        /**
         * The format of the image
         */
        format?: AttachmentOptions['forceFormat'];
        /**
         * The breakpoints object for the image
         */
        breakpoints?: Record<keyof ImageBreakpoints, ImageInfo>;
    }
    /**
     * Attachment class represents an attachment data type
     * for Lucid models
     */
    interface ResponsiveAttachmentContract extends ImageAttributes {
        /**
         * The breakpoint objects
         */
        breakpoints?: Record<keyof ImageBreakpoints, ImageInfo>;
        /**
         * The URLs object
         */
        urls?: UrlRecords | null;
        /**
         * "isLocal = true" means the instance is created locally
         * using the bodyparser file object
         */
        isLocal: boolean;
        /**
         * Find if the file has been persisted or not.
         */
        isPersisted: boolean;
        /**
         * Find if the file has been deleted or not
         */
        isDeleted: boolean;
        /**
         * Define persistance options
         */
        setOptions(options?: AttachmentOptions): this;
        /**
         * Save responsive images to the disk. Results if noop when "this.isLocal = false"
         */
        save(): Promise<any>;
        /**
         * Delete the responsive images from the disk
         */
        delete(): Promise<void>;
        /**
         * Computes the URLs for the responsive images.
         * @param options
         * @param options.forced Force the URLs to be completed whether
         * `preComputedURLs` is true or not
         */
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
         * Attachment attributes
         * Convert attachment to plain object to be persisted inside
         * the database
         */
        toObject(): AttachmentAttributes;
        /**
         * Attachment attributes + url
         * Convert attachment to JSON object to be sent over
         * the wire
         */
        toJSON(): (AttachmentAttributes & (UrlRecords | undefined)) | null;
    }
    /**
     * File attachment decorator
     */
    type ResponsiveAttachmentDecorator = (options?: AttachmentOptions & Partial<ColumnOptions>) => <TKey extends string, TTarget extends {
        [K in TKey]?: ResponsiveAttachmentContract | null;
    }>(target: TTarget, property: TKey) => void;
    /**
     * Attachment class constructor
     */
    interface AttachmentConstructorContract {
        new (attributes: ImageAttributes, file?: MultipartFileContract): ResponsiveAttachmentContract;
        fromFile(file: MultipartFileContract): ResponsiveAttachmentContract;
        fromDbResponse(response: string): ResponsiveAttachmentContract;
        fromBuffer(buffer: Buffer): ResponsiveAttachmentContract;
        getDrive(): DriveManagerContract;
        setDrive(drive: DriveManagerContract): void;
    }
    const responsiveAttachment: ResponsiveAttachmentDecorator;
    const ResponsiveAttachment: AttachmentConstructorContract;
}
