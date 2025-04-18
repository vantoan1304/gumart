const fs = require('fs');
const path = require('path');
const axios = require('axios');
const colors = require('colors');
const { DateTime } = require('luxon');
const { HttpsProxyAgent } = require('https-proxy-agent');
const os = require('os');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const { randomInt } = require('crypto');


getConfig = function () {
    try {
        const fileContent = fs.readFileSync("config.json", "utf8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading or parsing file:", error);
    }
}

let config = getConfig();
let timeRun = config.timeRerun;
let tat_bat_taks = config.isTaks;
let batDaily = config.daily;
let win_scale = config.win_scale;

let win_size = config.win_size;
let timeLoad_iframe = config.timeLoad_iframe
let timeLoad_channel = config.timeLoad_channel
let linkChannel = config.linkChannel
let idRef = config.idRef
let linkRef = config.linkRef



checkGumart = function () {
    if(config.gumart === true) {
        return 'gumart'
    } else {
        return ''
    }
}


const maxThreads = config.MULTI_THREAD;

class Gumart {
    constructor(accountIndex, proxy, initData) {
        this.accountIndex = accountIndex;
        this.proxy = proxy;
        this.initData = initData;
       
        this.authorization = '';
        this.headers = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "vi,en;q=0.9",
            "access-control-allow-origin": "*",
            "content-type": "application/json",
            "origin": "https://d2kpeuq6fthlg5.cloudfront.net",
            "priority": "u=1, i",
            "referer": "https://d2kpeuq6fthlg5.cloudfront.net/",
            "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            
        };
        this.proxyIP = null;
        this.axios = axios.create({ headers: this.headers });
    }

    async log(msg, type = 'info') {
        const timestamp = new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"});
        const accountPrefix = `[${timestamp}][TK ${this.accountIndex + 1}]`;
        const ipPrefix = this.proxyIP ? `[${this.proxyIP}]` : '[Unknown IP]';
        let logMessage = '';

        switch(type) {
            case 'success':
                logMessage = `${accountPrefix} | ${msg}`.green;
                break;
            case 'error':
                logMessage = `${accountPrefix} | ${msg}`.red;
                break;
            case 'warning':
                logMessage = `${accountPrefix} | ${msg}`.yellow;
                break;
            default:
                logMessage = `${accountPrefix} | ${msg}`.blue;
        }

        console.log(logMessage);
    }

    async checkProxyIP() {
        try {
            const proxyAgent = new HttpsProxyAgent(this.proxy);
            const response = await axios.get('https://api.ipify.org?format=json', { httpsAgent: proxyAgent });
            if (response.status === 200) {
                this.proxyIP = response.data.ip;
                return response.data.ip;
            } else {
                throw new Error(`Cannot check proxy IP. Status code: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Error checking proxy IP: ${error.message}`);
        }
    }

    async makeRequest(url, method, data={}) {
        const headers = { ...this.headers };
        const proxyAgent = new HttpsProxyAgent(this.proxy);

        try {
            const response = await axios({
                method,
                url,
                data,
                headers,
                httpsAgent: proxyAgent,
                // timeout: 1e4
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }



    // async autoGetIf() {
    //     let idGpm = this.idGpm;
    //     const x = randomInt(0, 81) * 50; 
    //     const y = randomInt(0, 4) * 50;
    //     const win_pos = `${x},${y}`;
    //     const res = await this.makeRequest(`http://127.0.0.1:19995/api/v3/profiles/start/${idGpm}?win_scale=${win_scale}&win_pos=${win_pos}&win_size=${win_size}`, 'get');
    //     this.log(`Đã mở chorme...!!!`, 'success')
    //     if(res.success === true) {

    //         let remoteDebuggingAddress = res.data.data.remote_debugging_address;
            
    //         await new Promise(resolve => setTimeout(resolve, 3000));
    //         // options.setChromeBinaryPath(driver_path);

    //         const browser = await puppeteer.connect({
    //             browserURL: `http://${remoteDebuggingAddress}`,
    //             timeout: 60000, // Tăng timeout  // Cổng của remote debugging
    //           });
              
    //         const pages = await browser.pages();          
           
    //         const page = pages[0]; 
           
    //         // / Xử lý lỗi khi thêm script
    //         try {
              
    //             await page.evaluateOnNewDocument(() => {
    //                 Object.defineProperty(navigator, 'webdriver', {
    //                     get: () => false,
    //                 });
    //             });
    //         } catch (error) {
    //             console.error('Lỗi khi thêm script:', error);
    //         }
            
    //         try {
    //         // Vào = linkRef 
    //             if(linkRef === true) {
    //                 this.log(`Đang vào = link Ref`, 'info')
    //                 await page.goto(`https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3Dgumart_bot%26startapp%3D1117773123`); 
    //                 // Chờ trang tải xong
    //                 let closeTime = timeLoad_channel + timeLoad_iframe + 5;
                    
    //                 this.log(`Chờ ${timeLoad_channel}s để load vào link Ref`, 'info')
    //                 await new Promise(resolve => setTimeout(resolve, timeLoad_channel*1000));
    //                 const [launch] = await page.$x('//span[text()="Launch"]');
    //                     if(launch){
    //                         await launch.click();
    //                     }
    //                     this.log(`Chờ ${timeLoad_iframe}s để load Iframe`, 'warning')
    //                     await new Promise(resolve => setTimeout(resolve, timeLoad_iframe*1000));
    //                     const [iframeElementHandle] = await page.$x('//iframe[@class="payment-verification"]');

    //                     if (iframeElementHandle) {
    //                         // Lấy giá trị 'src' của iframe
    //                         const iframeSrc = await page.evaluate(iframe => iframe.src, iframeElementHandle);

    //                         const index1 = iframeSrc.indexOf("#tgWebAppData");
    //                         const index2 = iframeSrc.indexOf("&tgWebAppVersion");
    //                         const result = iframeSrc.slice(index1 + 14, index2);
                            
                            
    //                         this.initData = decodeURIComponent(result);
    //                         this.log(`Lấy iframe thành công !!! `, 'success')
                            
    //                     } else {
    //                         this.log('Không tìm thấy iframe', 'error');
    //                         await browser.close();
    //                     } 
                        
    //             }
    //             // vào = link Channel
    //             else {
    //                 await page.goto(linkChannel); 

    //             // Chờ trang tải xong
    //             this.log(`Chờ ${timeLoad_channel}s để load vào link channel`, 'info')
    //             await new Promise(resolve => setTimeout(resolve, timeLoad_channel*1000));
    //                 // Các thao tác khác như tìm và click phần tử
    //                 const [linkref] = await page.$x('//a[contains(@href,"https://t.me/gumart_bot") and @class="anchor-url"]');

    //                 if (linkref) {
    //                     await linkref.click();
    //                     await new Promise(resolve => setTimeout(resolve, 2000));
    //                     const [launch] = await page.$x('//span[text()="Launch"]');
    //                     if(launch){
    //                         await launch.click();
    //                     }
    //                     this.log(`Chờ ${timeLoad_iframe}s để load Iframe`, 'warning')
    //                     await new Promise(resolve => setTimeout(resolve, timeLoad_iframe*1000));
    //                     const [iframeElementHandle] = await page.$x('//iframe[@class="payment-verification"]');

    //                     if (iframeElementHandle) {
    //                         // Lấy giá trị 'src' của iframe
    //                         const iframeSrc = await page.evaluate(iframe => iframe.src, iframeElementHandle);

    //                         const index1 = iframeSrc.indexOf("#tgWebAppData");
    //                         const index2 = iframeSrc.indexOf("&tgWebAppVersion");
    //                         const result = iframeSrc.slice(index1 + 14, index2);
                            
                            
    //                         this.initData = decodeURIComponent(result);
    //                         this.log(`Lấy iframe thành công !!! `, 'success')
                            
    //                     } else {
    //                         this.log('Không tìm thấy iframe', 'error');
    //                         await browser.close();
    //                     }
    //                 } else {
    //                     this.log('Không tìm thấy linkref', 'error');
    //                     await browser.close();
    //                 }
    //             }
            
    //         } catch (error) {
    //             console.error('Lỗi:', error);
    //         } finally {
    //             await browser.close(); // Đóng trình duyệt sau khi mọi thao tác hoàn thành
    //         }
            
    //     } else {
    //         this.log(` Lỗi mở trình duyệt `)
    //     }
        
    //   }


    fs = e => {
        const n = Object.fromEntries(Object.entries({
            a: "Q",
        b: "3",
        c: "X",
        d: "9",
        e: "V",
        f: "4",
        g: "Z",
        h: "1",
        i: "B",
        j: "7",
        k: "M",
        l: "0",
        m: "J",
        n: "L",
        o: "6",
        p: "Y",
        q: "5",
        r: "K",
        s: "8",
        t: "W",
        u: "2",
        v: "C",
        w: "A",
        x: "R",
        y: "E",
        z: "D",
        A: "u",
        B: "n",
        C: "t",
        D: "g",
        E: "h",
        F: "a",
        G: "s",
        H: "o",
        I: "p",
        J: "c",
        K: "m",
        L: "v",
        M: "f",
        N: "d",
        O: "j",
        P: "x",
        Q: "b",
        R: "i",
        S: "k",
        T: "z",
        U: "l",
        V: "y",
        W: "q",
        X: "r",
        Y: "e",
        Z: "w",
        0: "H",
        1: "N",
        2: "S",
        3: "I",
        4: "O",
        5: "P",
        6: "F",
        7: "G",
        8: "T",
        9: "U"
        }).map( ([r,s]) => [s, r]));
        return e.split("").map(r => n[r] || r).join("")
    }

    m3 (e, t, n, r)  {
        const s = t + e + n;
        return  CryptoJS.HmacSHA256(s, r).toString();
    }

    FA (){
        return this.fs("9OU49SIPXHFNIX4O4VIOTGSFNXX933IP") 
    } 
    PA (){
        return this.fs("QGFNXTSSINPUGXT3X3XSVNTUGSPQGIPO")
    } 
    MA (){
        return this.fs("UHHTQVQUUVIGSV3I3S44FQI4HXQOTUGP");
    } 

    IA (){
        return this.fs("t6LWVLW-zEYV")
    } 

    DA(){
        return this.fs("uXXV88-t6LWK60-u006A-jKBZBL")
    }

    BA () {
        return   this.fs("r-ihblhkz-uz").toUpperCase()
    }

    OA() {
        return this.fs("R-KV52V8W-MVE").toUpperCase()
    }


    Z1(e, t=!1) {
        const n = "https://api.gumart.click/api";
        let r = {...this.headers};
      
        {
            const o = Math.floor(Date.now() / 1e3).toString()
              , i = this.m3(o, this.FA(), this.PA(), this.MA());
            r["authorization"]  = this.authorization,
            r[this.BA()] = o,
            r[this.OA()] = i
        }
       
        const s = axios.create({
            baseURL: n,
            headers: r,
            timeout: 1e4
        });
        return s.interceptors.response.use(async o => o, o => Promise.reject(o)),
        s
    }
  

    async hn(e, t, n=!1, r=!1) {
        try {
            return await this.Z1(n, r).post(e, t)
        } catch (s) {
            console.log("error", s),
            console.log(s),
            s.code === "ECONNABORTED" ? ({
                message: "Timeout of 10 seconds exceeded",
                type: "error",
                grouping: !0
            }) : s.code === "ERR_NETWORK" && e === "/claim" && !s.request.status ? ({
                message: "Claim process too fast. Please try again.",
                type: "error",
                grouping: !0
            }) : ({
                message: s.message,
                type: "error",
                grouping: !0
            })
        }
    }

    async bn1(e, t, n=!1, r=!1) {
        try {
            return await this.z1(n, r).post(e, t)
        } catch (s) {
            console.log(s)
            
        }
    }

    

    async verify() {
       
            let payload = {
                ref_id: idRef,
                telegram_data: this.initData
            }

            // let rawData = JSON.stringify(payload);
            // console.log(`Check rawData: `,JSON.stringify(payload));
            const result = await this.makeRequest("https://api.gumart.click/api/verify", 'post', payload);
            return result;        
    }

    async login() {
        let payload = {
            g_recaptcha_response: null,
            mode: null,
            ref_id: idRef,
            telegram_data: this.initData
        }

        // let rawData = JSON.stringify(data);

        const result = await this.makeRequest("https://api.gumart.click/api/login", 'post', payload);
        
        if(result.success === true) {
            let access_token = result.data.data.access_token;
            let type_token = result.data.data.type_token;
            this.authorization = type_token + " " + access_token;
            this.headers["authorization"] = this.authorization;
            return result;
        }
    }
    async logCheckIn() {  
        const res = await this.makeRequest("https://api.gumart.click/api/streaks", 'get');
        return res;
    }
    async checkIn() {  
        const res = await this.makeRequest("https://api.gumart.click/api/streaks/check-in", 'post');
        return res;
    }

    async register_ref() { 
        const payload = {
            ref_telegram_id: idRef
        }
        const res = await this.makeRequest("https://api.gumart.click/api/invite/register-ref", 'post', payload);
        return res;
    }
    async home() { 
        const res = await this.makeRequest("https://api.gumart.click/api/home", 'get');
        return res;
    }

    
    async commission() { 
        const res = await this.makeRequest("https://api.gumart.click/api/commission", 'get');
        return res;
    }



    async claim() {
        try {
            const e = await this.hn("/claim", null, !1, !0);
            // console.log(`check claim`, e)
            let homes = await this.home();
            homes,
            e.data.status_code === 200 ? (homes.data.data.earned_amount = e.data.data.claim_value,
            this.timeNow = Math.floor(Date.now() / 1e3),
            setTimeout( () => {
                homes.data.data.balance = e.data.data.balance;
                
            }
            , 1e3)) : e.data.status_code === 429 ? ({
                message: e.data.message,
                type: "error",
                grouping: !0
            }) : ({
                message: "An error occurred. Please contact admin.",
                type: "error",
                grouping: !0
            })
            return e.data;
        } catch (e) {
            console.log(e)
        }
    }
    
    async boots() {
        const res = await this.makeRequest(" https://api.gumart.click/api/boost", 'post');
        return res;
       
    }

    async missions() {
        const res = await this.makeRequest("https://api.gumart.click/api/missions", 'get');
        return res;
    }

    async endCaptra() {
        const res = await this.makeRequest("https://api.gumart.click/api/missions/is-captcha-enabled", 'get');
        return res;
    }

    async startMission(id) { 
       let payload = {
        g_recaptcha_response: ""
       }
        const res = await this.hn(`/missions/${id}/start`, payload, !1, !0);
        
        return res.data;
    }

    async claimMission(id) {
        
        const res = await this.hn(`/missions/${id}/claim`, null, !1, !0);
        return res.data;
    }

    async wallet() {
        const res = await this.makeRequest("https://api.gumart.click/api/wallet", 'get');
        return res;
    }

    async startTaskGumart(arrayTasks) {
        for(let i = 0; i < arrayTasks.length; i++) {
            let mission = arrayTasks[i].missions;
          
            for(let j = 0; j < mission.length; j++) {
                let taskId = mission[j].id;
                // console.log(`Check taskId`, taskId)
                let checkClaim = mission[j].status;
               
                if(checkClaim === 'startable') {
                    // console.log(`Check Claim: `,'ok');
                
                    let resTask = await this.startMission(taskId);
                    // console.log(`check resTask`, resTask)
                    this.log(`Start Mission: ${mission[j].description}`, 'logMessage');
                    this.log(`Waiting 10s sau khi đã Start nv ${mission[j].description}`, 'blue');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                   
                 
                    if(j <= mission.length) {
                        //Chờ 15s để start Mission khác
                        this.log(`Waiting 15s next start the mission ${mission[j].description}`, 'warning');
                        await new Promise(resolve => setTimeout(resolve, 15000));
                    }
                   
                } else if (checkClaim === 'in_progress') {
                    this.log(`NV Task đang đợi 5' mới xác minh xong ${mission[j].description}`, 'warning');
                } 
            
            }
           
        }              
                
    }

    async claimTaskGumart(arrayTasks) {
        for(let i = 0; i < arrayTasks.length; i++) {
            let mission = arrayTasks[i].missions;
            for(let j = 0; j < mission.length; j++) {
                let taskId = mission[j].id;
                let checkStatus = mission[j].status;
                if(checkStatus === 'claimable') {
                //Chờ 5' để Claim Mission khác
                    // this.log(`Waiting 5 phút before claiming the mission`, 'blue');
                    // await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
                    let claimTask = await this.claimMission(taskId);
                
                        if(claimTask.data.status === 'finished') {
                        this.log(`Claim Mission ${claimTask.data.description} - Done !!!`, 'success');
                        } else {
                            this.log(`Claim Mission ${claimTask.data.description} - Error`, 'error');
                        }
                        //Chờ 3s để Claim Mission khác
                        if(j < mission.length) {
                            this.log(`Waiting 15s next claiming the mission`, 'blue');
                            await new Promise(resolve => setTimeout(resolve, 15000));
                        }
                        
                
                }   
            }
                
        }       
                
    }
    
    // Daily

    async startDaily(arrayTasks) {
        for(let i = 0; i < arrayTasks.length; i++) {
           let taskId = arrayTasks[i].id;
            // console.log(`Check taskId`, taskId)
            let checkClaim = arrayTasks[i].status;
               
                if(checkClaim === 'startable') {
                    // console.log(`Check Claim: `,'ok');
                
                    let resTask = await this.startMission(taskId);
                    // console.log(`check res Claim`, resTask)
                    this.log(`Start Mission: ${arrayTasks[i].description}`, 'logMessage');
                    // this.log(`Waiting 10s sau khi đã Start nv ${arrayTasks[i].description}`, 'blue');
                    // await new Promise(resolve => setTimeout(resolve, 10000));
                   
                 
                    if(i < arrayTasks.length) {
                        //Chờ 15s để start Mission khác
                        this.log(`Chờ 15s để tới làm task ${arrayTasks[i].description}`, 'warning');
                        await new Promise(resolve => setTimeout(resolve, 15000));
                    }
                   
                } else if (checkClaim === 'in_progress') {
                    this.log(`NV Task đang đợi 5' mới xác minh xong ${arrayTasks[i].description}`, 'warning');
                } 
            
            
           
        }              
                
    }


    // Claim daily
    async claimDaily(arrayTasks) {
        for(let i = 0; i < arrayTasks.length; i++) {
           
                let taskId = arrayTasks[i].id;
                let checkStatus = arrayTasks[i].status;
              
                if(checkStatus === 'claimable') {
                //Chờ 5' để Claim Mission khác
                    this.log(`Waiting 5 phút before claiming the mission ${arrayTasks[i].title}`, 'blue');
                    await new Promise(resolve => setTimeout(resolve, 6 * 60 * 1000));
                    let claimTask = await this.claimMission(taskId);
                    let checkttttt = claimTask.data.status;
                    // console.log(`check Status`, claimTask)
                        if(claimTask.status_code === 200 && claimTask.data.status === 'finished') {
                            this.log(`Claim Mission ${claimTask.data.description} - Done !!!`, 'success');
                          
                        } else if(claimTask.status_code === 400) {
                            this.log(`Lỗi Mission ${claimTask.message}`, 'error');
                        }
                        else {
                            this.log(`Claim Mission ${claimTask.data.description} - Error`, 'error');
                        }
                       if(i < arrayTasks.length) {
                        this.log(`Waiting 15s next claiming the mission`, 'blue');
                        await new Promise(resolve => setTimeout(resolve, 15000));
                       }
                        
                
                }     
                
        }       
                
    }
    
    
    async processAccount() {
        try {
            await this.checkProxyIP();
        } catch (error) {
            this.log(`Cannot check proxy IP: ${error.message}`, 'warning');
        }

        let loginSuccess = false;
        let loginAttempts = 0;
        let loginResult;

        while (!loginSuccess && loginAttempts < 1) {
            loginAttempts++;
            // await this.autoGetIf();
            
            this.log(` Bắt đầu tiền trình chạy tool `, 'info');
            loginResult = await this.verify();
            // console.log(`Check loginResult: `,loginResult);
            if (loginResult.data.data.is_verify === 1) {
                let isLogin = await this.login();
                // console.log(`Check isLogin: `,isLogin);
                if(isLogin.success === true) {
                    loginSuccess = true;
                    // let ref = await this.register_ref();
                    let home = await this.home();
                    let logCheckIn = await this.logCheckIn();
                    
                    
                    if(logCheckIn.success === true) {
                        let hasCheckin = logCheckIn.data.data.today_checkin_status;
                        if(hasCheckin === 0) {
                            let checkIn = await this.checkIn()
                            if(checkIn.success === true) {
                                this.log(`Check in ok`, 'success')
                            }
                        } else {
                            this.log(` Hôm nay đã check in rồi`, 'info')
                        }
                    }
                    
                    await this.commission();
                    // console.log(`Check Home: `,home);
                    this.log(`Login success - Balance: ${home.data.data.balance} - Tier: ${home.data.data.tier_current}`, 'success');
                    // if(ref.success === true) {
                    //     this.log(` Đăng ký ref thành công`, 'success')
                    // }
                    let checkBooots = home.data.data.boost;
                
                    let timeNow = new Date();
                    let nextTimeBoots = Date.parse(timeNow);
                    if(checkBooots === 100 || checkBooots < nextTimeBoots) {
                        let boots = await this.boots();
                        if(boots.success === true) {
                            let hom = await this.home();
                            this.log(`Đã bật Boots thành công + ${hom.data.data.boost}%`, 'warning');
                        }
                    } else {
                        this.log(`Boots đã được bật rồi + ${home.data.data.boost}%`)
                    }
                    
                    let timeClaim = home.data.data.user_claim_timestamp;
                    let timeClaimNow = home.data.data.claim_timestamp;
                    let checkNextClaim = (timeClaimNow - timeClaim);
                    let timeCho = 60 - checkNextClaim
                    console.log(`check timeClaim`, timeClaim, 'timeClaimNow', timeClaimNow, 'CHecknextClaim', checkNextClaim);
                    if(timeClaimNow - timeClaim > 60) {
                        let claim = await this.claim();
                        console.log(`chek claim`, claim);
                     
                        let wallet = await this.wallet();
                       
                        let gtp = wallet.data.data.tokens[2].items[0].value
                        if(claim.status_code === 200) {
                            this.log(`Claim thành công được: ${claim.data.claim_value} - Balance: ${claim.data.balance} - Tiền $: ${wallet.data.data.total_balance}$ - GTP: ${gtp}`, 'success');
                        } else if (claim.status_code === 429) {
                            this.log(` Thời gian claim tiền tiếp ít nhất sau 10s nữa `, 'warning')
                        }
                        else {
                            this.log(`Claim lỗi`, 'error')
                        }
                    } else {
                        this.log(` Vừa Claim rồi phải đợi ${timeCho}s nữa nó mới cho Claim `, 'warning')
                    }
                    
                    
                    // 1. Claim thành công
                     // Tạo một mảng chứa tất cả các loại nhiệm vụ
                    let missions = await this.missions();
                    // console.log(`check mission`, missions)
                    if (missions.success === true) {

                        await this.endCaptra();
                    
                        let daily = missions.data.data.missions.daily;
                        // console.log(`check daily`, daily)
                        // Daily
                        await this.startDaily(daily);
                        await this.claimDaily(daily)   
                        
                        
                        if(tat_bat_taks === true) {
                        
                            let tasks = missions.data.data.tasks;
                            let fixed = missions.data.data.missions.fixed;
                            // console.log(`check fixed`,fixed)
                            //Fixed
                            // await this.startDaily(fixed);
                            // await this.claimDaily(fixed)    

                            // // Task
                            await this.startTaskGumart(tasks);
                            await this.claimTaskGumart(tasks)
                            
                        }    
                       
                    } else {
                        this.log(` Không load được Misson!!! `, 'error')
                    }
                        
            } else {
                this.log(`Đăng nhập thất bại: ${loginResult.error}`, 'error');
                if (loginAttempts < 1) {
                    this.log('Thử lại...', 'info');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }

        if (!loginSuccess) {
            this.log('Đăng nhập không thành công . Bỏ qua tài khoản.', 'error');
            return;
        }    
    }
    }
    
}

function formatProxy(proxy) {
    const [ip, port, username, password] = proxy.split(':');
    return `${process.env.PROXY_TYPE}://${username}:${password}@${ip}:${port}`;
}

const interfaces = os.networkInterfaces();
for (let interface in interfaces) {
    for (let details of interfaces[interface]) {
        if (details.mac && details.mac !== '00:00:00:00:00:00') {
            var machineId = details.mac.replace(/:/g, '').toUpperCase();
        }
    }
}

// Tạo key từ thông tin máy
function hgu34dfk4rgg4g(machineId, secret, botName) {
    const data = machineId + secret + botName;
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Ví dụ sử dụng
const secret = "F_SJu*vTD*9Z5z!Q";
const botName = "gumart";
const licenseKey = hgu34dfk4rgg4g(machineId, secret, botName);

async function hgu34dfk4rgg() {
    try {
        const response = await axios.post("https://api.thietkeweb2tr.com/create-key", {
            user_key: licenseKey,
            status: 'inactive',
            device_mac: machineId,
            bot_name: botName
        }, { httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });

        const data = response.data;
        if (data.errCode === 0) {
            console.warn(`Key: ${licenseKey} đã được đăng ký lần đầu. Vui lòng kích hoạt để sử dụng. Telegram: @vantoanhd`);
            process.exit();
        } else {
            console.error(`Đăng ký key lỗi: ${data.message}`);
            process.exit();
        }
    } catch (error) {
        console.error(`Đăng ký key lỗi: ${error.message}`);
        process.exit();
    }
}

async function hgu34dfgg() {
    try {
        const response = await axios.post("https://api.thietkeweb2tr.com/active-key", {
            user_key: licenseKey
        }, { httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });

        const data = response.data;
       
        if (data.errCode === 0) {
            console.info(`Key: ${licenseKey} đã được kích hoạt`);
        } else if (data.errCode === -1) {
            console.error(`Key: ${licenseKey} chưa được kích hoạt. Vui lòng liên hệ Telegram: @vantoanhd`);
            process.exit();
        } else if (data.errCode === -2) {
            await hgu34dfk4rgg();
        } 
    } catch (error) {
        console.error(`Kiểm tra key lỗi: ${error.message}`);
        process.exit();
    }
}


async function main() {
    await hgu34dfgg();
    const dataFile = path.join(__dirname, 'data.txt');
    const data = fs.readFileSync(dataFile, 'utf8')
        .replace(/\r/g, '')
        .split('\n')
        .filter(Boolean);

    const proxyFile = path.join(__dirname, 'proxy.txt');
    const proxies = fs.readFileSync(proxyFile, 'utf8')
        .replace(/\r/g, '')
        .split('\n')
        .filter(Boolean);

    while (true) {
        for (let i = 0; i < data.length; i += maxThreads) {
            const batch = data.slice(i, i + maxThreads);

            const promises = batch.map((initData, indexInBatch) => {
                const accountIndex = i + indexInBatch;
                const proxy = formatProxy(proxies[accountIndex % proxies.length]);
                const client = new Gumart(accountIndex, proxy, initData);
               
                return timeout(client.processAccount(), 10 * 60 * 1000).catch(err => {
                    client.log(`Lỗi xử lý tài khoản: ${err.message}`, 'error');
                });
            });

            await Promise.allSettled(promises);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        console.log(`Hoàn thành tất cả tài khoản, chờ ${timeRun} phút để tiếp tục -- Devtool by @vantoanhd`);
        await new Promise(resolve => setTimeout(resolve, timeRun*60*1000));
    }
    await hgu34dfgg();
}

function timeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Timeout'));
        }, ms);

        promise.then(value => {
            clearTimeout(timer);
            resolve(value);
        }).catch(err => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
