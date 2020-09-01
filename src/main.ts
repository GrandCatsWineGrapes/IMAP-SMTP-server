import path from 'path';
import express,
{ Express, NextFunction, Request, Response } from 'express';
import { serverInfo } from './ServerInfo';
import * as IMAP from './IMAP';
import * as SMTP from './SMTP';
import * as Contacts from './contacts';
import { IContact } from './contacts';

const app: Express = express();
app.use(express.json());

app.use('/', express.static(path.join(__dirname, "../../client/dist")));

app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header('Access-Control-Allow-Origin', '*');
    inResponse.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    inResponse.header('Access-Contol-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
    inNext();
})

app.get('/mailboxes', async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
        inResponse.status(200).json(mailboxes);
    } catch (inError) {
        inResponse.send(inError);
    }
})

app.get('/mailboxes/:mailbox', async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messages: IMAP.IMessage[] = await imapWorker.listMessages({
            mailbox : inRequest.params.mailbox
        });
        inResponse.json(messages).status(200);
    } catch (inError) {
        inResponse.send(inError);
    }
})

app.get('/messages/:mailbox/:id', async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messageBody: string = await imapWorker.getMessageBody({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        })
        inResponse.send(messageBody).status(200)
    } catch (inError) {
        inResponse.send(inError);
    }
})

app.delete('/messages/:mailbox/:id', async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        await imapWorker.deleteMessage({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        })
        inResponse.send('ok')
    } catch (inError) {
        inResponse.send(inError)
    }
})

app.post('/messages', async (inRequest: Request, inResponse: Response) => {
    try {
        const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
        await smtpWorker.sendMessage(inRequest.body);
        inResponse.send('ok');
    } catch (inError) {
        inResponse.status(200).send(inError)
    }
})

app.get('/contacts', async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contacts: IContact[] = await contactsWorker.listContacts();
        inResponse.json(contacts);
    } catch (inError) {
        inResponse.send(inError)
    }
})

app.post('/contacts', async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contact: IContact = await contactsWorker.addContact(inRequest.body);
        inResponse.status(201).json(contact)
    } catch (inError) {
        inResponse.send(inError)
    }
})

app.delete('/contacts/:id', async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        await contactsWorker.deleteContact(inRequest.params.id);
        inResponse.send('ok');
    } catch (inError) {
        inResponse.send(inError)
    }
})

app.put('/contacts/:id', async (req: Request, res: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        await contactsWorker.updateContact(req.params.id, req.body)
        res.status(201).send(`Contact with id: ${req.params.id} updated`)
    } catch (err) {
        res.send(err)
    }
})

app.listen(3000, "localhost");