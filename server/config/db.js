
const mongoose = require('mongoose'),
    Schema = require('../models/schemas.js'),
    Config = require('./config');
    
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

class MongoDB{
    static getInstance() {
        if (!this.instance) {
            this.instance = new MongoDB();
        }
        return this.instance;
    }

    constructor() {
        if (!this.client)
            this.client = '';
        this.connect();
    }

    connect() {
        return new Promise((resolve, reject) => {
            let _that = this;
            if (_that.client === '') {
                console.log("Mongoose connecting......");
                _that.client = mongoose.connect(Config.mongoDB.dbUrl + Config.mongoDB.dbName, { useNewUrlParser: true });
                mongoose.connection.on('connected', () => {
                    console.log(`Mongoose connected on ${Config.mongoDB.dbUrl + Config.mongoDB.dbName}`);
                    resolve(_that.client);
                });
                mongoose.connection.on('disconnected', (err) => {
                    console.log("Mongoose disconnected");
                    reject(err);
                });
            } else {
                resolve(_that.client);
            }
        });
    }

    /**
     *
     * @param table : String
     * @param obj : Object
     * @param canRepeat: Boolean
     * @return await : {status: 0}数据已经存在,无法插入
     * @return await : {status: 1}数据插入成功
     */
    insert(table, obj, canRepeat) {
        return new Promise((resolve, reject) => {
            try {
                //默认允许插入重复数据
                const flag = canRepeat === undefined ? true : canRepeat;
                this.connect().then(() => {
                    flag ?
                        new Schema[table](obj).save(err => {
                            if (err)
                                reject({"status": 0, "message": err});
                            else
                                resolve({"status": 1, "message":"SUCCESS"});
                        }) :
                        this.findInTable(table, obj).then(res => {
                            if (res.length > 0) {
                                resolve({"status": 0, "message":"DUPLICATE"});
                            }
                            new Schema[table](obj).save(err => {
                                if (err)
                                    reject({"status": 0, "message": err});
                                else
                                    resolve({"status": 1, "message":"SUCCESS"});
                            })
                        })
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        });
    }

    /**
     * 
     * @param {*} table 
     * @param {*} obj 
     */
    insertMany(table, obj) { 

        return new Promise((resolve, reject) => {
            try {
                this.connect().then(() => {
                    Schema[table].insertMany(obj, (err, docs) => {
                        if (err)
                            reject({"status": 0, "message": err});
                        else
                            resolve({"status": 1, "message":"SUCCESS", "data": docs});
                    });
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        });

    }

    /**
     *
     * @param table : String
     * @param obj : Object
     * @returns await : {length: 长度, data: 数据}
     */
    findInTable(table, obj = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.connect().then(() => {
                    Schema[table].find(obj, (err, doc) => {
                        if (err) 
                            reject({ "status":0, "message":err });
                        else 
                            resolve({ "length": doc.length, "message":"SUCCESS", "data":doc });
                    });
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        });
    }

    /**
     *
     * @param table : String
     * @param obj : Objects []
     * @returns await : {length: 长度, data: 数据}
     */
    aggregate(table, obj = []) {
        return new Promise((resolve, reject) => {
            try {
                this.connect().then(() => {
                    Schema[table].aggregate(obj, (err, doc) => {
                        if (err) 
                            reject({ "status":0, "message":err });
                        else 
                            resolve({ "length": doc.length, "message":"SUCCESS", "data":doc });
                        
                    });
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        });
    }
    


    /**
     *
     * @param table : String
     * @param obj : Object
     * @returns {Promise<any>}
     */
    delete(table, obj) {
        return new Promise((resolve, reject) => {
            try {
                this.connect().then(() => {
                    Schema[table].deleteMany(obj, err => {
                        if (err)
                            reject({"status": 0, "message": err});
                        else
                            resolve({"status": 1, "message":"SUCCESS"});
                    })
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        })
    }

    /**
     *
     * @param table : String
     * @param condition : Object 条件
     * @param newData : Object
     * @returns {Promise<any>}
     */
    updateData(table, condition, newData) {
        return new Promise((resolve, reject) => {
            try {
                this.connect().then(() => {
                    Schema[table].updateMany(condition, {$set: newData}, err => {
                        if (err)
                            reject({"status": 0, "message": err});
                        else
                            resolve({"status": 1, "message":"SUCCESS"});
                    })
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        })
    }
    //    
    findOneAndModify(table, condition, updateExp, options) {
        return new Promise((resolve, reject) => {
            try {
                this.connect().then(() => {
                    Schema[table].findOneAndUpdate(condition, updateExp, !options?{new: true}:options, (err, doc) => {
                        if (err) {
                            reject({ "status":0, "message":err });
                        } else {
                            resolve({ "status":1, "message":"SUCCESS", "data":doc });
                        }
                    })
                });
            } catch (e) {
                reject({"status": 0, "message": err});
            }
        })
    }
}

module.exports = MongoDB.getInstance();