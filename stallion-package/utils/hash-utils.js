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
exports.signBundle = signBundle;
exports.fileExistsAndIsZip = fileExistsAndIsZip;
exports.calculateSHA2565Hash = calculateSHA2565Hash;
exports.generatePackageManifest = generatePackageManifest;
exports.computePackageHash = computePackageHash;
const fs = __importStar(require("fs/promises"));
const fssync = __importStar(require("fs"));
const path = __importStar(require("path"));
const _ = __importStar(require("lodash"));
const crypto = __importStar(require("crypto"));
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const react_native_utils_1 = require("./react-native-utils");
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../api/config");
const mime = require("mime");
async function signBundle(bundlePath, privateKeyPath) {
    if (!privateKeyPath) {
        return;
    }
    let privateKey;
    try {
        privateKey = await fs.readFile(privateKeyPath);
    }
    catch {
        throw new Error(`The path specified for the signing key ("${privateKeyPath}") was not valid.`);
    }
    const signedFilePath = path.join(bundlePath, config_1.CONFIG.BUNDLE_EXTENSION);
    const fileHashMap = await generatePackageManifest(bundlePath, bundlePath);
    const packageHash = await computePackageHash(fileHashMap);
    const payload = { packageHash };
    try {
        const signedJwt = jwt.sign(payload, privateKey, { algorithm: "RS256" });
        await fs.writeFile(signedFilePath, signedJwt);
    }
    catch (err) {
        throw new Error(`Error signing bundle: ${err.message}`);
    }
}
function fileExistsAndIsZip(path) {
    const isFileExists = (0, react_native_utils_1.fileExists)(path);
    const isValidZip = mime.getType(path) === "application/zip";
    return isFileExists && isValidZip;
}
function calculateSHA2565Hash(path) {
    if (!fileExistsAndIsZip(path)) {
        return null;
    }
    const fileStream = (0, fs_1.readFileSync)(path);
    return (0, crypto_1.createHash)("sha256").update(fileStream).digest("hex");
}
const HASH_ALGORITHM = "sha256";
async function generatePackageManifest(directoryPath, basePath) {
    const fileHashMap = new Map();
    const filePathList = await getFilePathsInDir(directoryPath);
    if (!filePathList || filePathList.length === 0) {
        throw new Error("Error: Can't sign the release because no files were found.");
    }
    for (const filePath of filePathList) {
        const relativePath = normalizePath(path.relative(basePath, filePath));
        if (!isIgnored(relativePath)) {
            const hash = await hashFile(filePath);
            fileHashMap.set(relativePath, hash);
        }
    }
    return fileHashMap;
}
async function computePackageHash(fileHashMap) {
    let entries = [];
    fileHashMap.forEach((hash, name) => {
        entries.push(name + ":" + hash);
    });
    entries = entries.sort();
    return crypto
        .createHash(HASH_ALGORITHM)
        .update(JSON.stringify(entries))
        .digest("hex");
}
function hashFile(filePath) {
    const readStream = fssync.createReadStream(filePath);
    return hashStream(readStream);
}
async function hashStream(readStream) {
    const hash = crypto.createHash(HASH_ALGORITHM);
    return new Promise((resolve, reject) => {
        readStream.on("error", (error) => {
            reject(error);
        });
        hash.on("error", (error) => {
            reject(error);
        });
        const chunks = [];
        hash.on("data", (chunk) => {
            chunks.push(chunk);
        });
        hash.on("end", () => {
            const result = Buffer.concat(chunks).toString("hex");
            resolve(result);
        });
        readStream.pipe(hash);
    });
}
function normalizePath(filePath) {
    //replace all backslashes coming from cli running on windows machines by slashes
    return filePath.replace(/\\/g, "/");
}
async function getFilePathsInDir(dir) {
    const stats = await fs.stat(dir);
    if (stats.isDirectory()) {
        let files = [];
        for (const file of await fs.readdir(dir)) {
            files = files.concat(await getFilePathsInDir(path.join(dir, file)));
        }
        return files;
    }
    else {
        return [dir];
    }
}
function isIgnored(relativeFilePath) {
    const __MACOSX = "__MACOSX/";
    const DS_STORE = ".DS_Store";
    const CODEPUSH_METADATA = ".codepushrelease";
    return (_.startsWith(relativeFilePath, __MACOSX) ||
        relativeFilePath === DS_STORE ||
        _.endsWith(relativeFilePath, "/" + DS_STORE) ||
        relativeFilePath === CODEPUSH_METADATA ||
        _.endsWith(relativeFilePath, "/" + CODEPUSH_METADATA));
}
