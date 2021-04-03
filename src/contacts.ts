import * as path from 'path';
const Datastore = require('nedb');

export interface IContact {
    _id?: number, 
    name:string,
    email: string
}

export class Worker {
    /** Пародия на БД */
    private db: Nedb;
    constructor() {
        this.db = new Datastore({
            filename: path.join(__dirname, "contacts.db"),
            autoload: true
        })
    }
    /**
     * Функция отдает список контактов
     */
    public listContacts(): Promise<IContact[]> {
        return new Promise((resolve, reject) => {
            this.db.find({}, (error: Error, inDocs: IContact[]) => {
                if (error)
                    reject(error);
                else
                    resolve(inDocs);
            })
        })
    }

    /**
     * Функция добавляет контакт
     * @param contact контакт
     */
    public addContact(contact: IContact): Promise<IContact> {
        return new Promise((resolve, reject) => {
            this.db.insert(contact, (error: Error | null, newDoc: IContact) => {
                if (error) 
                    reject(error)
                else
                    resolve(newDoc)
            })
        })
    }

    /**
     * Функция удаляет контакт по id
     * @param id id контакта
     */
    public deleteContact(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.db.remove({_id: id}, { }, (error: Error | null, inNumRemoved: number) => {
                if (error)
                    reject(error)
                else
                    resolve(id)
            })
        })
    }

    /**
     * Функция обновляет контакт по id
     * @param id id обновляемого контакта
     * @param contact контакт
     */
    public updateContact(id: string, contact: IContact): Promise<string> {
        return new Promise((resolve, reject) => {
            this.db.update({_id: id}, { $set: contact}, { } , (err: Error | null) => {
                if (err)
                    reject(err)
                else
                    resolve(id)
            })
        })
    }
}