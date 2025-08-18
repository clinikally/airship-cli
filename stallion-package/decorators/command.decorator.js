"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.registeredCommands = void 0;
exports.getCommandMetadata = getCommandMetadata;
exports.getCommands = getCommands;
const COMMAND_METADATA_KEY = Symbol("command");
exports.registeredCommands = [];
const Command = (options) => {
    return function (target) {
        Reflect.defineMetadata(COMMAND_METADATA_KEY, options, target);
        exports.registeredCommands.push(target);
        return target;
    };
};
exports.Command = Command;
function getCommandMetadata(target) {
    return Reflect.getMetadata(COMMAND_METADATA_KEY, target);
}
function getCommands() {
    const commands = new Map();
    exports.registeredCommands.forEach((commandClass) => {
        const metadata = getCommandMetadata(commandClass);
        if (metadata) {
            commands.set(metadata.name, metadata);
        }
    });
    return commands;
}
