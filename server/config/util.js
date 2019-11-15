const MongoDB = require('./db.js');
const Md5 = require('md5');
const Moment = require('moment');

module.exports = {

    //唯一索引自增
    async getNextSequenceValue(sequenceName) {
        var sequenceDocument = "";
        await MongoDB.findOneAndModify("counter", { "key": sequenceName }, { $inc: { "sequence_value": 1 } }).then(res => { 
            sequenceDocument = res.data;
            
        });
        return sequenceDocument.sequence_value;
    },


    /**
     * 生产邀请码/推广码  (uuid) 码
     * @param {*} len 邀请码长度
     * @param {*} radix 基数
     */
    uuid(len, radix) {
        var chars = '8PF3KCL4Q1WDH0RTE5MX2NGJA9VYS7BU6'.split('');
        var uuid = [], i;
        radix = radix || chars.length;
    
        if (len) {
        // Compact form
            for (i = 0; i < len; i++) {
                uuid[i] = chars[0 | Math.random() * radix];
            }
        } else {
        // rfc4122, version 4 form
        var r;
    
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
    
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
            r = 0 | Math.random()*16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        }
 
        return uuid.join('');
    },

    /**
     * 将一个数据乱序
     * @param {*} arr 
     */
    shuffle(arr) {
        for (let i=arr.length-1; i>=0; i--) {
            let rIndex = Math.floor(Math.random()*(i+1));
            // 打印交换值
            // console.log(i, rIndex);
            let temp = arr[rIndex];
            arr[rIndex] = arr[i];
            arr[i] = temp;
        }
        return arr;
    },

    sign(json){
        var tempArr=[];
        for(let attr in json){
            tempArr.push(attr);
        }

        tempArr=tempArr.sort();

        var tempStr='';

        for(let j=0;j<tempArr.length;j++){
            tempStr+=tempArr[j]+json[tempArr[j]]
        }
        console.log(tempStr);
        return Md5(tempStr);
    },


    /**
     * 加密密码
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    hashPwd(data){
        return Md5(data);
    },

    getTradeNo(prefix) {
        return (prefix + "_" + this.getYiheCode());
    },

    generateSalt() {
        return Md5(this.getYiheCode());
    },

    getYiheCode() {
        let code = ""
        for(let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return Moment().format('YYYYMMDDHHmmss') + code;
    }





}