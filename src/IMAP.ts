const ImapClient = require('emailjs-imap-client')
import { ParsedMail } from 'mailparser'
import { simpleParser } from 'mailparser'
import { IServerInfo } from './ServerInfo'

export interface ICallOptions {
    mailbox: string,
    id?: number
}

export interface IMessage {
    id: string,
    date: string,
    from: string,
    subject: string,
    body?: string
}

export interface IMailbox {
    name: string,
    path: string
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


export class Worker {
    /** Информация о сервере */
    private static serverInfo: IServerInfo;
    constructor(serverInfo: IServerInfo) {
        Worker.serverInfo = serverInfo
    }

    /** Подключение к серверу */
    private async connectToServer(): Promise<any> {
        const client: any = new ImapClient.default(
            Worker.serverInfo.imap.host,
            Worker.serverInfo.imap.port,
            { auth: Worker.serverInfo.imap.auth }
        );
        client.logLevel = client.LOG_LEVEL_NONE;
        client.onerror = (error: Error) => {
            console.log(`IMAP.Worker.listMailboxes(): Connection error`, error);
        }
        await client.connect();
        return client;
    }

    /** Получить почтовых ящиков */
    public async listMailboxes(): Promise<IMailbox[]> {
        const client: any = await this.connectToServer();
        const mailboxes: any = await client.listMailboxes();
        await client.close;
        const finalMailboxes: IMailbox[] = [];
        const iterateChildren: Function = (inArray: any[]): void => {
            inArray.forEach((value: any) => {
                finalMailboxes.push({
                    name: value.name, 
                    path: value.path
                });
                iterateChildren(value.children);
            })
        }
        iterateChildren(mailboxes.children)
        return finalMailboxes;
    }

    /**
     * Функция отдает список сообщений
     * @param callOptions содержит название ящика и ID письма (здесь не используется).
     */
    public async listMessages(callOptions: ICallOptions): Promise<IMessage[]> {
        const client: any = await this.connectToServer();
        const mailbox: any = await client.selectMailbox(callOptions.mailbox);
        if (mailbox.exists === 0) {
            await client.close();
            return [];
        }
        const messages: any[] = await client.listMessages(callOptions.mailbox, "1:*", ["uid", "envelope"])
        await client.close();
        const finalMessages: IMessage[] = [];
        messages.forEach((value: any) => {
            finalMessages.push({
                id: value.uid, 
                date: value.envelope.date,
                from: value.envelope.from[0].adress,
                subject: value.envelope.subject
            })
        })
        return finalMessages;
    }

    /**
     * Функция отдает тело письма
     * @param callOptions содержит название ящика и ID письма
     */
    public async getMessageBody(callOptions: ICallOptions): Promise<string> {
        const client: any = await this.connectToServer();
        const messages: any[] = await client.listMessages(callOptions.mailbox, callOptions.id, ["body[]"], {byUid: true})
        const parsed: ParsedMail = await simpleParser(messages[0]["body[]"])
        await client.close();
        if (parsed.text)
            return parsed.text;
        else
            return `Error: message body is undefined`;
    }

    /**
     * Функция удаляет письмо по ID
     * @param callOptions содержит название ящика и ID письма
     */
    public async deleteMessage(callOptions: ICallOptions): Promise<any> {
        const client: any = await this.connectToServer();
        await client.deleteMessages(
            callOptions.mailbox, callOptions.id, {byUid: true}
        );
        await client.close();
    }
}