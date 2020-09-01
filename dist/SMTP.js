"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
var nodemailer = require('nodemailer');
var Worker = /** @class */ (function () {
    function Worker(inServerInfo) {
        Worker.serverInfo = inServerInfo;
    }
    Worker.prototype.sendMessage = function (inOptions) {
        return new Promise(function (inResolve, inReject) {
            var transport = nodemailer.createTransport(Worker.serverInfo.smtp);
            transport.sendMail(inOptions, function (inError, inInfo) {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve();
                }
            });
        });
    };
    return Worker;
}());
exports.Worker = Worker;
