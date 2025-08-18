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
exports.progress = progress;
const tty = __importStar(require("tty"));
const ora = require("ora");
/**
 * Shows a progress spinner for an async operation
 * @param title The text to show while the operation is in progress
 * @param action The promise to track
 * @returns The result of the promise
 */
function progress(title, action) {
    const stdoutIsTerminal = tty.isatty(1);
    if (stdoutIsTerminal) {
        const spinner = ora({
            text: title,
            color: "white",
        }).start();
        return action
            .then((result) => {
            spinner.succeed();
            return result;
        })
            .catch((ex) => {
            spinner.fail();
            throw ex;
        });
    }
    else {
        return action;
    }
}
// Helper functions that need to be implemented
function formatIsParsingCompatible() {
    // TODO: Implement based on your needs
    return false;
}
function isQuiet() {
    // TODO: Implement based on your needs
    return false;
}
