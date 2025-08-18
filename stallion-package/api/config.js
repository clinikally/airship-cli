"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    API: {
        BASE_URL: process.env.AIRSHIP_API_BASE_URL
            ? `${process.env.AIRSHIP_API_BASE_URL}/api/v1`
            : "http://localhost:8000/api/v1",
    },
    UI: {
        BASE_URL: process.env.AIRSHIP_UI_BASE_URL
            ? process.env.AIRSHIP_UI_BASE_URL
            : "http://localhost:3000",
    },
    BUNDLE_EXTENSION: ".airshipsigned",
};
