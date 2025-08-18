"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersion = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const getVersion = () => {
    try {
        const packageJsonPath = (0, path_1.join)(__dirname, "../", "package.json");
        const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, "utf8"));
        return packageJson.version;
    }
    catch (error) {
        return "0.0.0"; // Fallback version if package.json cannot be read
    }
};
exports.getVersion = getVersion;
