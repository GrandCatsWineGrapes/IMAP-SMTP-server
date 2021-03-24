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

app.use(function(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.header('Access-Contol-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
    next();
})

app.get('/mailboxes', async (req: Request, res: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
        res.status(200).json(mailboxes);
    } catch (err) {
        res.send(err);
    }
})

app.get('/mailboxes/:mailbox', async (req: Request, res: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messages: IMAP.IMessage[] = await imapWorker.listMessages({
            mailbox : req.params.mailbox
        });
        res.json(messages).status(200);
    } catch (err) {
        res.send(err);
    }
})

app.get('/messages/:mailbox/:id', async (req: Request, res: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messageBody: string = await imapWorker.getMessageBody({
            mailbox: req.params.mailbox,
            id: parseInt(req.params.id, 10)
        })
        res.send(messageBody).status(200)
    } catch (err) {
        res.send(err);
    }
})

app.delete('/messages/:mailbox/:id', async (req: Request, res: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        await imapWorker.deleteMessage({
            mailbox: req.params.mailbox,
            id: parseInt(req.params.id, 10)
        })
        res.send('ok')
    } catch (err) {
        res.send(err)
    }
})

app.post('/messages', async (req: Request, res: Response) => {
    try {
        const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
        await smtpWorker.sendMessage(req.body);
        res.send('ok');
    } catch (err) {
        res.status(200).send(err)
    }
})

app.get('/contacts', async (req: Request, res: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contacts: IContact[] = await contactsWorker.listContacts();
        res.json(contacts);
    } catch (err) {
        res.send(err)
    }
})

app.post('/contacts', async (req: Request, res: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contact: IContact = await contactsWorker.addContact(req.body);
        res.status(201).json(contact)
    } catch (err) {
        res.send(err)
    }
})

app.delete('/contacts/:id', async (req: Request, res: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        await contactsWorker.deleteContact(req.params.id);
        res.send('ok');
    } catch (err) {
        res.send(err)
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