import Mail from 'nodemailer/lib/mailer';
import { SendMailOptions, SentMessageInfo } from 'nodemailer';
import { IServerInfo } from './ServerInfo';
const nodemailer = require('nodemailer');

export class Worker {
    /** Информация о сервере  */
    private static serverInfo: IServerInfo;
    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    }
    /**
     * Функция отправляет письмо
     * @param options опции письма (от кого, кому etc.)
     */
    public sendMessage(options: SendMailOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const transport: Mail = nodemailer.createTransport(Worker.serverInfo.smtp);
            transport.sendMail(options, (error: Error | null, info: SentMessageInfo) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        })
    }
}