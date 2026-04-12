export declare const EVENT_LOGOS_SUBDIR = "event-logos";
export declare const EVENT_LOGO_MAX_BYTES: number;
export declare function extForImageMime(mime: string): string | null;
export declare function publicEventLogoPath(eventId: string, ext: string): string;
export declare function absolutePathFromPublicUploads(publicPath: string): string;
export declare function safeUnlinkUpload(publicPath: string | null | undefined): void;
export declare function eventLogosAbsoluteDir(): string;
