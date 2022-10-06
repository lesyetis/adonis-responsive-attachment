/// <reference types="node" />
declare module '@ioc:Adonis/Addons/ResponsiveAttachment' {
    type ImageBreakpoints = {
        thumbnail: ImageAttributes;
        large: ImageAttributes;
        medium: ImageAttributes;
        small: ImageAttributes;
    } & Record<string, ImageAttributes>;
    type ImageInfo = {
        name?: string;
        hash?: string;
        extname?: string;
        mimeType?: string;
        size?: number;
        path?: string;
        buffer?: Buffer;
        width?: number;
        height?: number;
        /**
         * The image format used by sharp to force conversion
         * to different file types/formats
         */
        format?: AttachmentOptions['forceFormat'];
        breakpoints?: Record<keyof ImageBreakpoints, ImageInfo>;
        url?: string;
    };
    type ImageData = {
        data: {
            fileInfo: ImageInfo | ImageInfo[];
        };
        files: AttachedImage;
    };
    type AttachedImage = {
        filePath?: string;
        name?: string;
        type?: string;
        size: number;
    };
    type EnhancedImageInfo = {
        absoluteFilePath: string;
        type: string;
        size: number;
    };
    type OptimizedOutput = {
        buffer?: Buffer;
        info?: {
            width: number;
            height: number;
            size: number;
            format: AttachmentOptions['forceFormat'];
            mimeType: string;
            extname: string;
        };
    };
    type ImageDimensions = {
        width?: number;
        height?: number;
    };
    type BreakpointFormat = ({
        key: keyof ImageBreakpoints;
    } & {
        file: ImageInfo;
    }) | null;
    type AttachmentAttributes = Partial<ImageInfo>;
    type FileDimensions = {
        width?: number;
        height?: number;
    };
    type UrlRecords = {
        url?: string;
        breakpoints?: Record<keyof ImageBreakpoints, {
            url?: string;
        }>;
    };
    type NameRecords = {
        name?: string;
        breakpoints?: Record<keyof ImageBreakpoints, {
            name?: string;
        }>;
    };
}
