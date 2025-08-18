"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptText = promptText;
exports.promptConfirm = promptConfirm;
exports.promptSelect = promptSelect;
exports.promptMultiSelect = promptMultiSelect;
exports.promptPassword = promptPassword;
exports.promptNumber = promptNumber;
const inquirer_1 = __importDefault(require("inquirer"));
/**
 * Prompt for a text input
 */
async function promptText(message, defaultValue) {
    const { answer } = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "answer",
            message,
            default: defaultValue,
        },
    ]);
    return answer;
}
/**
 * Prompt for a yes/no confirmation
 */
async function promptConfirm(message, defaultValue = true) {
    const { answer } = await inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "answer",
            message,
            default: defaultValue,
        },
    ]);
    return answer;
}
/**
 * Prompt to select a single choice from a list
 */
async function promptSelect(message, choices) {
    const { answer } = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "answer",
            message,
            choices,
        },
    ]);
    return answer;
}
/**
 * Prompt to select multiple choices from a list
 */
async function promptMultiSelect(message, choices) {
    const { answer } = await inquirer_1.default.prompt([
        {
            type: "checkbox",
            name: "answer",
            message,
            choices,
        },
    ]);
    return answer;
}
/**
 * Prompt for a password
 */
async function promptPassword(message) {
    const { answer } = await inquirer_1.default.prompt([
        {
            type: "password",
            name: "answer",
            message,
            mask: "*",
        },
    ]);
    return answer;
}
/**
 * Prompt for a number input
 */
async function promptNumber(message, defaultValue) {
    const { answer } = await inquirer_1.default.prompt([
        {
            type: "number",
            name: "answer",
            message,
            default: defaultValue,
            validate: (value) => typeof value === "number" && !isNaN(value)
                ? true
                : "Please enter a valid number",
        },
    ]);
    return answer;
}
