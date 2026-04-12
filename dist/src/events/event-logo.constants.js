"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_LOGO_MAX_BYTES = exports.EVENT_LOGOS_SUBDIR = void 0;
exports.extForImageMime = extForImageMime;
exports.publicEventLogoPath = publicEventLogoPath;
exports.absolutePathFromPublicUploads = absolutePathFromPublicUploads;
exports.safeUnlinkUpload = safeUnlinkUpload;
exports.eventLogosAbsoluteDir = eventLogosAbsoluteDir;
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
exports.EVENT_LOGOS_SUBDIR = 'event-logos';
exports.EVENT_LOGO_MAX_BYTES = 2 * 1024 * 1024;
const MIME_TO_EXT = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
};
function extForImageMime(mime) {
    return MIME_TO_EXT[mime] ?? null;
}
function publicEventLogoPath(eventId, ext) {
    return `/uploads/${exports.EVENT_LOGOS_SUBDIR}/${eventId}${ext}`;
}
function absolutePathFromPublicUploads(publicPath) {
    const rel = publicPath.replace(/^\/+/, '');
    return (0, node_path_1.join)(process.cwd(), rel);
}
function safeUnlinkUpload(publicPath) {
    if (!publicPath?.startsWith('/uploads/')) {
        return;
    }
    const abs = absolutePathFromPublicUploads(publicPath);
    if ((0, node_fs_1.existsSync)(abs)) {
        try {
            (0, node_fs_1.unlinkSync)(abs);
        }
        catch {
        }
    }
}
function eventLogosAbsoluteDir() {
    return (0, node_path_1.join)(process.cwd(), 'uploads', exports.EVENT_LOGOS_SUBDIR);
}
//# sourceMappingURL=event-logo.constants.js.map