"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const base_command_1 = require("../command-line/base.command");
const command_decorator_1 = require("../decorators/command.decorator");
const logger_1 = require("../utils/logger");
let HelpCommand = class HelpCommand extends base_command_1.BaseCommand {
    async execute() {
        const commands = (0, command_decorator_1.getCommands)();
        logger_1.logger.title("\nAvailable Commands");
        logger_1.logger.subtitle("==================\n");
        commands.forEach((options, name) => {
            logger_1.logger.command(name, options.description, options.alias);
        });
    }
};
exports.HelpCommand = HelpCommand;
exports.HelpCommand = HelpCommand = __decorate([
    (0, command_decorator_1.Command)({
        name: "help",
        description: "Show help",
        alias: "h",
    })
], HelpCommand);
