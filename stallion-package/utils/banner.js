"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBanner = void 0;
const gradient_string_1 = __importDefault(require("gradient-string"));
const chalk_1 = __importDefault(require("chalk"));
const figlet = require("figlet");
const version_1 = require("./version");
const showBanner = async () => {
    return new Promise((resolve, reject) => {
        figlet.text("STALLION", {
            font: "Larry 3D",
            horizontalLayout: "default",
            verticalLayout: "default",
        }, (err, data) => {
            if (err) {
                reject("Something went wrong...");
                return;
            }
            // Apply retro gradient to the banner
            const gradientBanner = gradient_string_1.default.retro.multiline(data || "");
            console.log(gradientBanner);
            console.log("\n" +
                chalk_1.default.whiteBright(`⚡ Welcome to the Stallion CLI ${chalk_1.default.bold(chalk_1.default.greenBright(`v${(0, version_1.getVersion)()}`))} ⚡ \n`));
            resolve();
        });
    });
};
exports.showBanner = showBanner;
