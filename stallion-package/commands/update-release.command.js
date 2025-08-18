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
exports.UpdateReleaseCommand = void 0;
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
        description: "Hash of the bundle to update the release to",
        required: true,
    },
    {
        name: "is-mandatory",
        description: "To set whether the release is mandatory",
        required: false,
    },
    {
        name: "is-paused",
        description: "To set whether the release is paused",
        required: false,
    },
    {
        name: "is-rolled-back",
        description: "To set whether the release is rolled back",
        required: false,
    },
    {
        name: "rollout-percent",
        description: "Rollout percentage of the release",
        required: false,
    },
    {
        name: "release-note",
        description: "Release note of the release to update",
        required: false,
    },
    {
        name: "ci-token",
        description: "The CI token generated from the stallion dashboard",
        required: true,
    },
];
let UpdateReleaseCommand = class UpdateReleaseCommand extends base_command_1.BaseCommand {
    constructor() {
        super();
    }
    async execute(options) {
        logger_1.logger.info("Starting update-release command");
        if (!this.validateOptions(options, expectedOptions)) {
            return;
        }
        const { projectId, hash, releaseNote, isMandatory, isPaused, isRolledBack, rolloutPercent, ciToken, } = options;
        const data = {
            projectId,
            hash,
            releaseNote,
            isMandatory,
            isPaused,
            isRolledBack,
            rolloutPercent: rolloutPercent ? Number(rolloutPercent) : undefined,
        };
        const client = new api_client_1.ApiClient(config_1.CONFIG.API.BASE_URL);
        try {
            await (0, progress_1.progress)(chalk_1.default.white("Updating release"), this.updateRelease(client, data, ciToken));
            logger_1.logger.success("Release updated successfully!");
        }
        catch (error) {
            logger_1.logger.error("Failed to update release");
            throw error;
        }
    }
    async updateRelease(client, data, ciToken) {
        const { data: updateReleaseResp } = await client.post(endpoints_1.ENDPOINTS.PROMOTE.UPDATE_RELEASE, data, {
            headers: {
                "x-ci-token": ciToken,
            },
        });
        return updateReleaseResp;
    }
};
exports.UpdateReleaseCommand = UpdateReleaseCommand;
exports.UpdateReleaseCommand = UpdateReleaseCommand = __decorate([
    (0, command_decorator_1.Command)({
        name: "update-release",
        description: "Update a release",
        alias: "ur",
        options: expectedOptions,
    }),
    (0, validate_user_decorator_1.ValidateUser)(),
    __metadata("design:paramtypes", [])
], UpdateReleaseCommand);
