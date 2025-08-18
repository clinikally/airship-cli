"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.logger = {
    success: (message) => console.log(chalk_1.default.green("✓"), message),
    error: (message) => console.log(chalk_1.default.red("✗"), message),
    info: (message) => console.log(chalk_1.default.blue("ℹ"), message),
    warning: (message) => console.log(chalk_1.default.yellow("⚠"), message),
    title: (message) => console.log(chalk_1.default.bold.cyan(message)),
    subtitle: (message) => console.log(chalk_1.default.cyan(message)),
    command: (name, description, alias) => {
        const aliasText = alias ? chalk_1.default.gray(`(${alias})`) : "";
        console.log(chalk_1.default.green(name), aliasText);
        console.log(chalk_1.default.gray(`  ${description}\n`));
    },
};
