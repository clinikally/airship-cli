"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateKeyPairCommand = void 0;
const command_decorator_1 = require("../decorators/command.decorator");
const react_native_utils_1 = require("../utils/react-native-utils");
const base_command_1 = require("../command-line/base.command");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = require("crypto");
const chalk_1 = __importDefault(require("chalk"));
let GenerateKeyPairCommand = class GenerateKeyPairCommand extends base_command_1.BaseCommand {
    constructor() {
        super();
        this.contentRootPath = process.cwd();
    }
    async execute() {
        if (!(0, react_native_utils_1.getReactNativeVersion)()) {
            throw new Error("No react native project found in current directory");
        }
        const secretKeysPath = path_1.default.join(this.contentRootPath, "stallion", "secret-keys");
        await promises_1.default.mkdir(secretKeysPath, { recursive: true });
        const privateKeyPath = path_1.default.join(secretKeysPath, "private-key.pem");
        const publicKeyPath = path_1.default.join(secretKeysPath, "public-key.pem");
        try {
            // Generate key pair using crypto module
            const { privateKey, publicKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            });
            // Write keys to files
            await promises_1.default.writeFile(privateKeyPath, privateKey);
            await promises_1.default.writeFile(publicKeyPath, publicKey);
            // Relative paths for display
            const relativePrivatePath = path_1.default.relative(this.contentRootPath, privateKeyPath);
            const relativePublicPath = path_1.default.relative(this.contentRootPath, publicKeyPath);
            const projectDir = path_1.default.basename(this.contentRootPath);
            console.log("\n" +
                chalk_1.default.green("🔐 Key Pair Generated Successfully!\n"));
            console.log(chalk_1.default.cyan("📍 Location\n"));
            console.log(`  Public Key : ${chalk_1.default.yellow(`${projectDir}/${relativePublicPath}`)}\n`);
            console.log(`  Private Key: ${chalk_1.default.yellow(`${projectDir}/${relativePrivatePath}`)}\n`);
            console.log(chalk_1.default.cyan("📆 Created At:"), chalk_1.default.white(new Date().toString()), "\n\n");
            console.log(chalk_1.default.red("🚫 Keep your private key secure. Do NOT share it.\n\n"));
            // Add important notes about key management
            console.log(chalk_1.default.bold.yellow('⚠️  IMPORTANT NOTICE – READ CAREFULLY ⚠️\n'));
            console.log(chalk_1.default.yellow('1.') +
                ' ' +
                chalk_1.default.white('🔐 It is ' +
                    chalk_1.default.bold('solely your responsibility') +
                    ' to securely store and manage your cryptographic signing keys. Losing them can critically disrupt your release pipeline.\n'));
            console.log(chalk_1.default.yellow('2.') +
                ' ' +
                chalk_1.default.white('❌ ' +
                    chalk_1.default.bold('Do NOT regenerate keys') +
                    ' unless absolutely necessary. Regenerating keys may break compatibility with existing Stallion releases and hinder OTA delivery.\n'));
            console.log(chalk_1.default.red.bold('\nStallion cannot recover or validate lost keys.\n'));
        }
        catch (error) {
            console.log("\n" +
                chalk_1.default.red("🔐 Failed to generate keys!\n"));
            if (error instanceof Error) {
                console.log(chalk_1.default.red(`Error: ${error.message}\n`));
            }
        }
    }
};
exports.GenerateKeyPairCommand = GenerateKeyPairCommand;
exports.GenerateKeyPairCommand = GenerateKeyPairCommand = __decorate([
    (0, command_decorator_1.Command)({
        name: "generate-key-pair",
        description: "Generate Private & Public keys",
        alias: "gkp",
    }),
    __metadata("design:paramtypes", [])
], GenerateKeyPairCommand);
