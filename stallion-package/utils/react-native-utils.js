"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReactNativeVersion = getReactNativeVersion;
exports.directoryExistsSync = directoryExistsSync;
exports.isValidPlatform = isValidPlatform;
exports.fileDoesNotExistOrIsDirectory = fileDoesNotExistOrIsDirectory;
exports.isDirectory = isDirectory;
exports.createEmptyTmpReleaseFolder = createEmptyTmpReleaseFolder;
exports.removeReactTmpDir = removeReactTmpDir;
exports.runReactNativeBundleCommand = runReactNativeBundleCommand;
exports.runHermesEmitBinaryCommand = runHermesEmitBinaryCommand;
exports.fileExists = fileExists;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const rimraf = __importStar(require("rimraf"));
const logger_1 = require("./logger");
const childProcess = __importStar(require("child_process"));
const semver_1 = require("semver");
function findUpwardReactNativePackageJson(startDir = process.cwd()) {
    let current = startDir;
    while (current !== path.parse(current).root) {
        const candidate = path.join(current, "node_modules", "react-native", "package.json");
        if (fs.existsSync(candidate))
            return candidate;
        current = path.dirname(current);
    }
    return null;
}
function getReactNativeVersion() {
    const rnPackageJsonPath = findUpwardReactNativePackageJson();
    if (!rnPackageJsonPath) {
        return null;
    }
    const rnPackageJson = JSON.parse(fs.readFileSync(rnPackageJsonPath, "utf-8"));
    return rnPackageJson.version;
}
function directoryExistsSync(dirname) {
    try {
        return fs.statSync(dirname).isDirectory();
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    return false;
}
function getReactNativePackagePath() {
    const rnPackageJsonPath = findUpwardReactNativePackageJson();
    if (rnPackageJsonPath) {
        return path.dirname(rnPackageJsonPath);
    }
    const result = childProcess.spawnSync("node", [
        "--print",
        "require.resolve('react-native/package.json')",
    ]);
    const packagePath = path.dirname(result.stdout.toString().trim());
    if (result.status === 0 && directoryExistsSync(packagePath)) {
        return packagePath;
    }
    return path.join("node_modules", "react-native");
}
function isValidPlatform(platform) {
    return (platform?.toLowerCase() === "android" || platform?.toLowerCase() === "ios");
}
function fileDoesNotExistOrIsDirectory(path) {
    try {
        return isDirectory(path);
    }
    catch (error) {
        return true;
    }
}
function isDirectory(path) {
    return fs.statSync(path).isDirectory();
}
function createEmptyTmpReleaseFolder(folderPath) {
    rimraf.sync(folderPath);
    fs.mkdirSync(folderPath);
}
function removeReactTmpDir() {
    rimraf.sync(`${os.tmpdir()}/react-*`);
}
function getCliPath() {
    return path.join(getReactNativePackagePath(), "cli.js");
}
async function runReactNativeBundleCommand(bundleName, entryFile, outputFolder, platform, devMode) {
    const reactNativeBundleArgs = [];
    Array.prototype.push.apply(reactNativeBundleArgs, [
        getCliPath(),
        "bundle",
        "--dev",
        devMode,
        "--assets-dest",
        outputFolder,
        "--bundle-output",
        path.join(outputFolder, bundleName),
        "--entry-file",
        entryFile,
        "--platform",
        platform,
    ]);
    logger_1.logger.info(`Running \"react-native bundle\" command`);
    logger_1.logger.subtitle(reactNativeBundleArgs.join(" "));
    const reactNativeBundleProcess = childProcess.spawn("node", reactNativeBundleArgs);
    return new Promise((resolve, reject) => {
        reactNativeBundleProcess.stdout.on("data", (data) => {
            console.log(data.toString().trim());
        });
        reactNativeBundleProcess.stderr.on("data", (data) => {
            logger_1.logger.error(data.toString().trim());
        });
        reactNativeBundleProcess.on("close", (exitCode, signal) => {
            if (exitCode !== 0) {
                reject(new Error(`\"react-native bundle\" command failed (exitCode=${exitCode}, signal=${signal}).`));
            }
            resolve();
        });
    });
}
async function runHermesEmitBinaryCommand(bundleName, outputFolder, hermesLogs = false) {
    const hermesArgs = [];
    Array.prototype.push.apply(hermesArgs, [
        "-emit-binary",
        "-out",
        path.join(outputFolder, bundleName + ".hbc"),
        path.join(outputFolder, bundleName),
    ]);
    logger_1.logger.info("Converting JS bundle to byte code via Hermes");
    const hermesCommand = await getHermesCommand();
    const hermesProcess = childProcess.spawn(hermesCommand, hermesArgs);
    logger_1.logger.info(`Running: ${hermesCommand} ${hermesArgs.join(" ")}`);
    let logFile = null;
    let isWarned = false;
    if (hermesLogs) {
        logFile = fs.createWriteStream("output.log", { flags: "a" });
    }
    return new Promise((resolve, reject) => {
        hermesProcess.stdout.on("data", (data) => {
            logger_1.logger.info(data.toString().trim());
        });
        hermesProcess.stderr.on("data", (data) => {
            if (isWarned) {
                if (hermesLogs && logFile) {
                    logFile.write(data.toString().trim());
                }
                return;
            }
            isWarned = true;
            logger_1.logger.warning("⚠️ Hermes command executed successfully with some warnings. If you need full logs, use the --hermes-logs command.\n");
        });
        hermesProcess.on("close", (exitCode, signal) => {
            if (hermesLogs && logFile) {
                logger_1.logger.success("📕 Done writing logs in output.log file.");
                logFile.end();
            }
            if (exitCode !== 0) {
                reject(new Error(`\"❌ hermes\" command failed (exitCode=${exitCode}, signal=${signal}).\n`));
            }
            const source = path.join(outputFolder, bundleName + ".hbc");
            const destination = path.join(outputFolder, bundleName);
            fs.copyFile(source, destination, (err) => {
                if (err) {
                    console.error(err);
                    reject(new Error(`Copying file ${source} to ${destination} failed. \"hermes\" previously exited with code ${exitCode}.`));
                }
                fs.unlink(source, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    resolve();
                });
            });
        });
    });
}
function getHermesOSBin() {
    switch (process.platform) {
        case "win32":
            return "win64-bin";
        case "darwin":
            return "osx-bin";
        case "freebsd":
        case "linux":
        case "sunos":
        default:
            return "linux64-bin";
    }
}
function getHermesOSExe() {
    const versionObj = (0, semver_1.coerce)(getReactNativeVersion());
    if (!versionObj?.version) {
        throw new Error("Unable to determine React Native version");
    }
    const react63orAbove = (0, semver_1.compare)(versionObj.version, "0.63.0") !== -1;
    const hermesExecutableName = react63orAbove ? "hermesc" : "hermes";
    switch (process.platform) {
        case "win32":
            return hermesExecutableName + ".exe";
        default:
            return hermesExecutableName;
    }
}
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (e) {
        return false;
    }
}
async function getHermesCommand() {
    const bundledHermesEngine = path.join(getReactNativePackagePath(), "sdks", "hermesc", getHermesOSBin(), getHermesOSExe());
    if (fileExists(bundledHermesEngine)) {
        return bundledHermesEngine;
    }
    const hermesEngine = path.join("node_modules", "hermes-engine", getHermesOSBin(), getHermesOSExe());
    if (fileExists(hermesEngine)) {
        return hermesEngine;
    }
    return path.join("node_modules", "hermesvm", getHermesOSBin(), "hermes");
}
