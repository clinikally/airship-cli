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
exports.FileTokenStore = void 0;
exports.createDefaultTokenStore = createDefaultTokenStore;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const lodash_1 = require("lodash");
class FileTokenStore {
    constructor(filePath) {
        this.tokenStoreCache = null;
        this.filePath = filePath;
    }
    getStoreFilePath() {
        return this.filePath;
    }
    async list() {
        return (0, lodash_1.toPairs)(this.cache).map(([key, value]) => ({
            key,
            accessToken: value,
        }));
    }
    async get(key) {
        const token = this.cache[key];
        return token ? { key, accessToken: token } : null;
    }
    async set(key, value) {
        this.cache[key] = value;
        this.writeTokenStoreCache();
    }
    async remove(key) {
        delete this.cache[key];
        this.writeTokenStoreCache();
    }
    /**
     * Safe accessor that ensures cache is loaded
     */
    get cache() {
        if (this.tokenStoreCache === null) {
            this.loadTokenStoreCache();
        }
        return this.tokenStoreCache;
    }
    loadTokenStoreCache() {
        try {
            fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        }
        catch (err) {
            if (err.code !== "EEXIST")
                throw err;
        }
        try {
            const content = fs.readFileSync(this.filePath, "utf8");
            this.tokenStoreCache = JSON.parse(content);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                this.tokenStoreCache = {};
            }
            else {
                throw err;
            }
        }
    }
    writeTokenStoreCache() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), "utf8");
    }
}
exports.FileTokenStore = FileTokenStore;
function createDefaultTokenStore() {
    const filePath = path.join(os.homedir(), ".stallion", "token-store.json");
    return new FileTokenStore(filePath);
}
