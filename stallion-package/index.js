#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const commander_1 = require("commander");
const command_registry_1 = require("./command-line/command.registry");
const command_decorator_1 = require("./decorators/command.decorator");
const banner_1 = require("./utils/banner");
const logger_1 = require("./utils/logger");
const version_1 = require("./utils/version");
const normalize_1 = require("./utils/normalize");
const rimraf_1 = require("rimraf");
const fs_1 = __importDefault(require("fs"));
const program = new commander_1.Command();
program
    .name("airship")
    .description("CLI tool for self-hosted OTA deployments with Airship")
    .version((0, version_1.getVersion)());
const registry = new command_registry_1.CommandRegistry();
(0, command_decorator_1.getCommands)().forEach((options, name) => {
    // Find the matching class
    const commandClass = [...command_decorator_1.registeredCommands].find((cls) => {
        const meta = (0, command_decorator_1.getCommandMetadata)(cls);
        return meta?.name === name;
    });
    if (!commandClass) {
        logger_1.logger.error(`No class found for command "${name}"`);
        return;
    }
    const instance = new commandClass();
    registry.registerCommand(name, instance);
    const command = program.command(name).description(options.description);
    if (options.alias) {
        command.alias(options.alias);
    }
    (options.options || []).forEach((opt) => {
        const flag = opt.required
            ? `--${opt.name} <${opt.name}>`
            : `--${opt.name} [${opt.name}]`;
        command.option(flag, opt.description, opt.defaultValue);
    });
    command.action(async (...args) => {
        try {
            await (0, banner_1.showBanner)();
            await registry.executeCommand(name, (0, normalize_1.normalizeOptions)(args.slice(0, args.length - 1)));
        }
        catch (error) {
            logger_1.logger.error(error instanceof Error ? error.message : "Unknown error");
            process.exit(1);
        }
    });
});
program.on("command:*", (operands) => {
    logger_1.logger.error(`Command "${operands[0]}" not found`);
    logger_1.logger.info(`Run "stallion help" to see all available commands`);
    process.exit(0);
});
program.parse();
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => process.on(signal, () => {
    process.exit(1);
}));
process.on("exit", () => {
    fs_1.default.readdirSync("./")
        .filter((f) => f.includes("stallion-temp"))
        .map((f) => rimraf_1.rimraf.sync(f));
});
