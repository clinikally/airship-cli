"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateUser = void 0;
exports.requiresValidation = requiresValidation;
require("reflect-metadata");
const VALIDATE_USER_METADATA_KEY = Symbol("validateUser");
const ValidateUser = () => {
    return function (target) {
        Reflect.defineMetadata(VALIDATE_USER_METADATA_KEY, true, target);
        return target;
    };
};
exports.ValidateUser = ValidateUser;
function requiresValidation(target) {
    return Reflect.getMetadata(VALIDATE_USER_METADATA_KEY, target) === true;
}
