"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishBundleCommand = void 0;
const base_command_1 = require("../command-line/base.command");
const command_decorator_1 = require("../decorators/command.decorator");
const validate_user_decorator_1 = require("../decorators/validate-user.decorator");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const react_native_utils_1 = require("../utils/react-native-utils");
const chalk_1 = __importDefault(require("chalk"));
const progress_1 = require("../utils/progress");
const api_client_1 = require("../api/api-client");
const hash_utils_1 = require("../utils/hash-utils");
const endpoints_1 = require("../api/endpoints");
const config_1 = require("../api/config");
const token_store_1 = require("../utils/token-store");
const archive_1 = require("../utils/archive");
const expectedOptions = [
    {
        name: "upload-path",
        description: "The path to the bundle to upload",
        required: true,
    },
    {
        name: "platform",
        description: "The platform to publish the bundle to (android or ios)",
        required: true,
    },
    {
        name: "release-note",
        description: "The release note of the bundle",
        required: true,
    },
    {
        name: "hermes-disabled",
        description: "Whether to disable Hermes",
        required: false,
    },
    {
        name: "ci-token",
        description: "The CI token generated from the stallion dashboard",
        required: false,
    },
    {
        name: "entry-file",
        description: "The entry file of your react native project",
        required: false,
    },
    {
        name: "hermes-logs",
        description: "All the hermes log will be saved in output.log file",
        required: false,
    },
    {
        name: "private-key",
        description: "Private key to sign the bundle",
        required: false,
    },
];
let PublishBundleCommand = class PublishBundleCommand extends base_command_1.BaseCommand {
    constructor() {
        super();
        this.contentRootPath = process.cwd();
    }
    async execute(options) {
        logger_1.logger.info("Starting publish-bundle command");
        if (!this.validateOptions(options, expectedOptions)) {
            return;
        }
        if (!(0, react_native_utils_1.getReactNativeVersion)()) {
            throw new Error("No react native project found in current directory");
        }
        const contentTempRootPath = await promises_1.default.mkdtemp(path_1.default.join(this.contentRootPath, "stallion-temp-"));
        this.contentRootPath = path_1.default.join(contentTempRootPath, "Stallion");
        await promises_1.default.mkdir(this.contentRootPath);
        let { uploadPath, platform, releaseNote, hermesDisabled, ciToken, entryFile, hermesLogs, privateKey, } = options;
        if (!(0, react_native_utils_1.isValidPlatform)(platform)) {
            throw new Error(`Platform must be "android" or "ios".`);
        }
        const bundleName = platform === "ios" ? "main.jsbundle" : `index.android.bundle`;
        if (!entryFile) {
            entryFile = "index.js";
        }
        else {
            if ((0, react_native_utils_1.fileDoesNotExistOrIsDirectory)(entryFile)) {
                throw new Error(`Entry file "${entryFile}" does not exist.`);
            }
        }
        await (0, react_native_utils_1.runReactNativeBundleCommand)(bundleName, entryFile, this.contentRootPath, platform, false // dev mode is false
        );
        const isHermesDisabled = hermesDisabled;
        if (!isHermesDisabled) {
            await (0, react_native_utils_1.runHermesEmitBinaryCommand)(bundleName, this.contentRootPath, hermesLogs);
        }
        if (privateKey) {
            await (0, progress_1.progress)(chalk_1.default.cyanBright("Signing Bundle"), (0, hash_utils_1.signBundle)(this.contentRootPath, privateKey));
        }
        await (0, progress_1.progress)(chalk_1.default.white("Archiving Bundle"), (0, archive_1.createZip)(this.contentRootPath, contentTempRootPath));
        const zipPath = path_1.default.resolve(contentTempRootPath, "build.zip");
        const client = new api_client_1.ApiClient(config_1.CONFIG.API.BASE_URL);
        const hash = await (0, progress_1.progress)(chalk_1.default.white("Publishing bundle"), this.uploadBundle(client, zipPath, uploadPath, platform, releaseNote, ciToken));
        logger_1.logger.success("Success!, Published new version");
        logger_1.logger.info(`Published bundle hash: ${hash}`);
    }
    async uploadBundle(client, filePath, uploadPath, platform, releaseNote, ciToken) {
        const tokenStore = (0, token_store_1.createDefaultTokenStore)();
        const tokenData = await tokenStore.get("cli");
        if (tokenData && tokenData.accessToken?.token) {
            client.setToken(tokenData.accessToken.token);
        }
        try {
            const hash = (0, hash_utils_1.calculateSHA2565Hash)(filePath);
            if (!hash) {
                throw new Error("Invalid path or not a valid zip file.");
            }
            const data = {
                hash,
                uploadPath: uploadPath?.toLowerCase(),
                platform: platform,
                releaseNote: releaseNote,
            };
            const headers = {};
            if (ciToken) {
                headers["x-ci-token"] = ciToken;
            }
            const endpoint = ciToken
                ? endpoints_1.ENDPOINTS.UPLOAD.GENERATE_SIGNED_URL_WITH_CI_TOKEN
                : endpoints_1.ENDPOINTS.UPLOAD.GENERATE_SIGNED_URL;
            const { data: signedUrlResp } = await client.post(endpoint, data, {
                headers,
            });
            const url = signedUrlResp?.url;
            if (!url) {
                throw new Error("Internal Error: invalid signed url");
            }
            headers["Content-Type"] = "application/zip";
            await client.put(url, (0, fs_1.readFileSync)(filePath), {
                headers,
            });
            return hash;
        }
        catch (e) {
            if (e.toString().includes("SignatureDoesNotMatch")) {
                throw "Error uploading bundle. Signature does not match.";
            }
            throw e;
        }
    }
};
exports.PublishBundleCommand = PublishBundleCommand;
exports.PublishBundleCommand = PublishBundleCommand = __decorate([
    (0, command_decorator_1.Command)({
        name: "publish-bundle",
        description: "Publish a bundle to the registry",
        alias: "pb",
        options: expectedOptions,
    }),
    (0, validate_user_decorator_1.ValidateUser)(),
    __metadata("design:paramtypes", [])
], PublishBundleCommand);
