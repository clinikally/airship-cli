"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
const validate_user_decorator_1 = require("../decorators/validate-user.decorator");
const logger_1 = require("../utils/logger");
// Command Imports
require("../commands/help.command");
require("../commands/publish-bundle.command");
require("../commands/login.command");
require("../commands/logout.command");
require("../commands/generate-key-pair.command");
require("../commands/release-bundle.command");
require("../commands/update-release.command");
class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }
    registerCommand(name, command) {
        this.commands.set(name, command);
    }
    getCommand(name) {
        return this.commands.get(name);
    }
    async validateUser(command) {
        try {
            await command.verifyLogin();
        }
        catch (error) {
            try {
                await command.login();
            }
            catch (error) {
                throw new Error("Failed to login. Please try again.");
            }
        }
    }
    shouldSkipValidationForCIToken(command, options) {
        const commandName = command.constructor.name;
        const supportsCIToken = ['PublishBundleCommand', 'ReleaseBundleCommand', 'UpdateReleaseCommand'];
        return supportsCIToken.includes(commandName) && Boolean(options.ciToken);
    }
    async executeCommand(name, options) {
        const command = this.getCommand(name);
        if (!command) {
            logger_1.logger.error(`Command not found "${name}"`);
            logger_1.logger.info('Use "stallion help" to list all available commands');
            return;
        }
        const needsValidation = (0, validate_user_decorator_1.requiresValidation)(command.constructor);
        const skipForCIToken = this.shouldSkipValidationForCIToken(command, options);
        if (needsValidation && !skipForCIToken) {
            try {
                logger_1.logger.info("Validating user");
                await this.validateUser(command);
            }
            catch {
                logger_1.logger.info("User validation failed");
                return;
            }
        }
        else if (needsValidation && skipForCIToken) {
            logger_1.logger.info("CI token provided, skipping user validation");
        }
        await command.execute(options);
    }
}
exports.CommandRegistry = CommandRegistry;
