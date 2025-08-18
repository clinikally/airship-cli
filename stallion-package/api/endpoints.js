"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENDPOINTS = void 0;
exports.ENDPOINTS = {
    CLI_LOGIN_INITIATE: "/dashboard/cli/user",
    CLI_GET_TOKEN: "/auth/cli/token",
    USER: {
        VERIFY: "/auth/user-profile",
    },
    UPLOAD: {
        GENERATE_SIGNED_URL: "/cli/gen-signed-url",
        GENERATE_SIGNED_URL_WITH_CI_TOKEN: "/cli/ci/gen-signed-url",
    },
    PROMOTE: {
        PROMOTE_BUNDLE: "/cli/ci/promote",
        UPDATE_RELEASE: "/cli/ci/update-release",
    },
};
