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
exports.ReleaseBundleCommand = void 0;
const base_command_1 = require("../command-line/base.command");
const command_decorator_1 = require("../decorators/command.decorator");
const validate_user_decorator_1 = require("../decorators/validate-user.decorator");
const logger_1 = require("../utils/logger");
const chalk_1 = __importDefault(require("chalk"));
const progress_1 = require("../utils/progress");
const api_client_1 = require("../api/api-client");
const endpoints_1 = require("../api/endpoints");
const config_1 = require("../api/config");
const expectedOptions = [
    {
        name: "project-id",
        description: "Project id of the app",
        required: true,
    },
    {
        name: "hash",
        description: "Hash of the bundle to promote",
        required: true,
    },
    {
        name: "app-version",
        description: "Target version of the app to promote the bundle to",
        required: true,
    },
    {
        name: "release-note",
        description: "Release note of the release",
        required: true,
    },
    {
        name: "ci-token",
        description: "CI token generated from the stallion dashboard",
        required: true,
    },
    {
        name: "is-mandatory",
        description: "To mark this release as mandatory",
        required: false,
    },
    {
        name: "is-paused",
        description: "To mark this release as paused",
        required: false,
    },
];
let ReleaseBundleCommand = class ReleaseBundleCommand extends base_command_1.BaseCommand {
    constructor() {
        super();
    }
    async execute(options) {
        logger_1.logger.info("Starting release-bundle command");
        if (!this.validateOptions(options, expectedOptions)) {
            return;
        }
        const { projectId, hash, appVersion, releaseNote, isMandatory, isPaused, ciToken, } = options;
        const data = {
            projectId,
            hash,
            appVersion,
            releaseNote,
            isMandatory,
            isPaused,
        };
        const client = new api_client_1.ApiClient(config_1.CONFIG.API.BASE_URL);
        await (0, progress_1.progress)(chalk_1.default.cyanBright("Releasing bundle"), this.releaseBundle(client, data, ciToken));
        logger_1.logger.success("Bundle released successfully!");
    }
    async releaseBundle(client, data, ciToken) {
        const { data: releaseBundleResp } = await client.post(endpoints_1.ENDPOINTS.PROMOTE.PROMOTE_BUNDLE, data, {
            headers: {
                "x-ci-token": ciToken,
            },
        });
        return releaseBundleResp;
    }
};
exports.ReleaseBundleCommand = ReleaseBundleCommand;
exports.ReleaseBundleCommand = ReleaseBundleCommand = __decorate([
    (0, command_decorator_1.Command)({
        name: "release-bundle",
        description: "Promote a bundle to a target app version",
        alias: "rb",
        options: expectedOptions,
    }),
    (0, validate_user_decorator_1.ValidateUser)(),
    __metadata("design:paramtypes", [])
], ReleaseBundleCommand);
