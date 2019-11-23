const MongoDB = require('./db.js');
const Md5 = require('md5');
const Moment = require('moment');
const fs = require('fs');
const qr = require('qr-image');
const gm = require("gm");

const Config = require("./config");

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
        var chars = '8PF3KCL4Q1WDHRTE5MX2NGJA9VYS7BU6'.split('');//32位去掉0，I，O，Z
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
        //console.log(tempStr);
        return Md5(tempStr);
    },

    /**
     * 生成6位激活码，输出全是大写
     * @param {*} json 姓名，手机号 
     */
    activateCode(json) {
        if (!json || !json.name || !json.mobilephone) {
            return null;
        }

        json.yiheSalt = Config.yihe_salt;
        console.log("json", json);
        let rawCode = this.sign(json);
        return rawCode.substr(16,6).toUpperCase();
    },

    /**
     * 加密密码
     * @param  {[type]} data [description]
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
    },


    /**
     * 根据网址生成二维码
     * 参数 url(string) 二维码的内容
     * 参数 fileName(string) 文件名
     */
    createQr(url, fileName) {
        //判断参数
        if (!url || url.trim() == "" || !fileName || fileName.trim() == "") {
            return { "status": { "code": 0, "message": "参数错误" } };
        }

        return new Promise((resolve, reject) => {
            try {
                let qr_png = qr.image(url,  { ec_level: 'Q',type: 'png', size: 4, margin: 1 });
                let filePath = Config.static_path + Config.poster_path + fileName.trim() + ".png";//文件路径（含文件名）
                let qr_pipe = qr_png.pipe(fs.createWriteStream(filePath));
            
                qr_pipe.on('error', (err) => {
                    reject({ "status": { "code": 0, "message": err } });
                })

                qr_pipe.on('finish', () => {
                    resolve({ "status": { "code": 1, "message": "SUCCESS" }, "data": filePath});//去掉"public/"
                })
            } catch (e) {
                console.log("error", e);
                reject({ "status": { "code": 0, "message": e } });
            }
        });
    },


/**
 * 给海报图片添加二维码水印
 * 参数 sourceImg(string) 原海报图片路径
 * 参数 watermark(string) 水印（二维码）图片路径
 */
    addWaterMark(source, watermark, output) {
        //判断参数
        if (!source || source.trim() == "" || !watermark || watermark.trim() == "") {
            return { "status": { "code": 0, "message": "参数错误" } };
        }

        return new Promise((resolve, reject) => {
            try {
                //不是以jpg结尾的
                if (output.length < 5 || output.substr(output.length - 4).toLowerCase() != ".jpg") {
                    output = output + ".jpg";
                }

                gm().in('-page', '+0+0')
                    .in(source)
                    .in('-page', '+450+670')
                    .in(watermark)
                    .mosaic()
                    //.flatten()
                    .write(output, (err) => {
                        if (err) {
                            console.log(err);
                            reject({ "status": { "code": 0, "message": err } });
                        } else {
                            resolve({ "status": { "code": 1, "message": "SUCCESS" }, "data": output});
                        }
                    });

                // images(source)                     //Load image from file 
                //     //加载图像文件
                //     .size(720)                          //Geometric scaling the image to 400 pixels width
                //     //等比缩放图像到400像素宽
                //     .draw(images(watermark), 70, 260)   //Drawn logo at coordinates (70,260)//为了遮住不该看的东西..
                //     //在(10,10)处绘制Logo
                //     .save(output, {               //Save the image to a file,whih quality 50
                //         quality: 50                    //保存图片到文件,图片质量为50
                //     });
                
            } catch (e) {
                console.log("error", e);
                reject({ "status": { "code": 0, "message": e } });
            }
        });
    
},


}