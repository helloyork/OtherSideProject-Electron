"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = Singleton;
function Singleton() {
    class Singleton {
        constructor() { }
        static getInstance() {
            if (!Singleton._instance) {
                Singleton._instance = new this();
            }
            return Singleton._instance;
        }
    }
    Singleton._instance = null;
    return Singleton;
}
