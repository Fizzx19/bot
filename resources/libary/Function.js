/**
 *  Don't sell this script!
 *  © 2024 by @choxzydev - Rasya 
 */

import { fileTypeFromBuffer } from "file-type";
import axios from "axios";
import FormData from "form-data";
import mimes from "mime-types";
import moment from "moment-timezone";
import { sizeFormatter } from 'human-readable';
import { toBuffer } from "@whiskeysockets/baileys";
import Config from "../Utils/Config.js";

export async function generateProfilePicture(buffer) {
    let Jimp = await import("jimp").then((jimp) => jimp.default);
    let jimp = await Jimp.read(buffer);
    const min = jimp.getWidth();
    const max = jimp.getHeight();
    const cropped = jimp.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    };
}
export function getRandom(ext) {
    return new Promise((resolve, reject) => {
        let a = Math.floor(Math.random() * 100000000000000000).toFixed(0)
        resolve(a + ext);
    })
}

export function uuid() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export const formatp = sizeFormatter({
    std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

export function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export async function getBuffer(url, options) {
    try {
        options ? options : {};
        const res = await axios({
            method: "get",
            url,
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Request": 1,
            },
            ...options,
            responseType: "arraybuffer",
        });
        return res.data;
    } catch (err) {
        return err;
    }
}

export function fetchBuffer(url, options = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                ...(!!options.headers ? options.headers : {}),
            },
            responseType: "stream",
            ...options
        }).then(async ({
            data,
            headers
        }) => {
            let buffer = await toBuffer(data)
            let position = headers.get("content-disposition")?.match(/filename=(?:(?:"|')(.*?)(?:"|')|([^"'\s]+))/)
            let filename = decodeURIComponent(position?.[1] || position?.[2]) || null
            let mimetype = mimes.lookup(filename) || (await fileTypeFromBuffer(buffer)).mime || "application/octet-stream"
            let ext = mimes.extension(mimetype) || (await fileTypeFromBuffer(buffer)).ext || "bin"

            resolve({
                data: buffer,
                filename,
                mimetype,
                ext
            })
        }).catch(reject)
    })
}
export function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                ...(!!options.headers ? options.headers : {}),
            },
            responseType: "json",
            ...options
        }).then(({
            data
        }) => resolve(data)).catch(reject)

    })
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function toTime(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':')
  }

export function isUrl(url) {
    let regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "gi")
    if (!regex.test(url)) return false
    return url.match(regex)
}

export const upload = {
    pomf(media) {
        return new Promise(async (resolve, reject) => {
            let mime = await fileTypeFromBuffer(media)
            let form = new FormData()

            form.append("files[]", media, `file-${Date.now()}.${mime.ext}`)

            axios.post("https://pomf.lain.la/upload.php", form, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                    ...form.getHeaders()
                }
            }).then(({
                data
            }) => resolve(data.files[0].url)).catch(reject)
        })
    },
    telegra(media) {
        return new Promise(async (resolve, reject) => {
            let mime = await fileTypeFromBuffer(media)
            let form = new FormData()

            form.append("file", media, `file-${Date.now()}.${mime.ext}`)

            axios.post("https://telegra.ph/upload", form, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                    ...form.getHeaders()
                }
            }).then(({
                data
            }) => resolve("https://telegra.ph" + data[0].src)).catch(reject)
        })
    }
}

export function formatSize(bytes, si = true, dp = 2) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
    }

    const units = si ?
        ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] :
        ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return `${bytes.toFixed(dp)} ${units[u]}`;
}

export function runtime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

export function countdramadhan() {
    const tanggalRamadhan = moment(`${Config.CountDown.ramadhan}`, 'YYYY-MM-DD');
    const tanggalHariIni = moment();
    const selisihHari = tanggalRamadhan.diff(tanggalHariIni, 'days');
    let pesan = '';
    if (selisihHari > 0) {
        pesan = `Tinggal ${selisihHari} hari menuju Ramadhan.`;
    } else if (selisihHari === 0) {
        pesan = `Hari ini adalah hari Ramadhan! Selamat menjalankan ibadah puasa.`;
    } else {
        pesan = `Ramadhan sudah berlalu. Semoga ibadah puasamu diterima.`;
    }
    
    return pesan;
}
export function ownerhbd() {
    const tanggalhbd = moment(`${Config.CountDown.hbdown}`, 'YYYY-MM-DD');
    const tanggaltoday = moment();
    const selisihHarii = tanggalhbd.diff(tanggaltoday, 'days');
    let habd = '';
    if (selisihHarii > 0) {
        habd = `Tinggal ${selisihHarii} hari menuju Ultah My Owner's`;
    } else if (selisihHarii === 0) {
        habd = `Hari ini adalah hari Ultah My Owner's, Tolong dikasih kado ya :>`;
    } else {
        habd = `Hari Ultah My Owner's telah berlalu.`;
    }
    
    return habd;
}
export function countdadha() {
    const adhaa = moment(`${Config.CountDown.adha}`, 'YYYY-MM-DD');
    const krban = moment();
    const slisih = adhaa.diff(krban, 'days');
    let mbek = '';
    if (slisih > 0) {
        mbek = `Tinggal ${slisih} hari menuju Idul Adha`;
    } else if (slisih === 0) {
        mbek = `Hari ini adalah hari Raya Idul Adha! Waktunya Qurban.`;
    } else {
        mbek = `Hari Raya Idul Adha telah berlalu.`;
    }
    
    return mbek;
}

export function getWaktuBukaPuasa() {
    return 'Normal Pada 18:30 Wib';
}

export function countdfitri() {
    // Tanggal Ramadhan tahun ini
    const tanggallebaran = moment('2024-04-13', 'YYYY-MM-DD');
    // Tanggal hari ini
    const tanggallnya = moment();
    
    // Hitung selisih hari antara hari ini dan tanggal Ramadhan
    const gganzm = tanggallebaran.diff(tanggallnya, 'days');
    
    // Membuat pesan balasan
    let meseg = '';
    if (gganzm > 0) {
        meseg = `Tinggal ${gganzm} Hari Lagi Lebaran.`;
    } else if (gganzm === 0) {
        meseg = `Selamat Hari Raya idul Fitri,Mohon Maaf Lahir dan Batin.`;
    } else {
        meseg = `Ramadhan sudah berlalu. Semoga ibadah puasamu diterima.`;
    }
    
    return meseg;
}

export function parseFileSize(input, si = true) {
    const thresh = si ? 1000 : 1024

    var validAmount = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    var parsableUnit = function (u) {
        return u.match(/\D*/).pop() === u;
    };

    var incrementBases = {
        2: [
            [
                ["b", "bit", "bits"], 1 / 8
            ],
            [
                ["B", "Byte", "Bytes", "bytes"], 1
            ],
            [
                ["Kb"], 128
            ],
            [
                ["k", "K", "kb", "KB", "KiB", "Ki", "ki"], thresh
            ],
            [
                ["Mb"], 131072
            ],
            [
                ["m", "M", "mb", "MB", "MiB", "Mi", "mi"], Math.pow(thresh, 2)
            ],
            [
                ["Gb"], 1.342e+8
            ],
            [
                ["g", "G", "gb", "GB", "GiB", "Gi", "gi"], Math.pow(thresh, 3)
            ],
            [
                ["Tb"], 1.374e+11
            ],
            [
                ["t", "T", "tb", "TB", "TiB", "Ti", "ti"], Math.pow(thresh, 4)
            ],
            [
                ["Pb"], 1.407e+14
            ],
            [
                ["p", "P", "pb", "PB", "PiB", "Pi", "pi"], Math.pow(thresh, 5)
            ],
            [
                ["Eb"], 1.441e+17
            ],
            [
                ["e", "E", "eb", "EB", "EiB", "Ei", "ei"], Math.pow(thresh, 6)
            ]
        ],
        10: [
            [
                ["b", "bit", "bits"], 1 / 8
            ],
            [
                ["B", "Byte", "Bytes", "bytes"], 1
            ],
            [
                ["Kb"], 125
            ],
            [
                ["k", "K", "kb", "KB", "KiB", "Ki", "ki"], 1000
            ],
            [
                ["Mb"], 125000
            ],
            [
                ["m", "M", "mb", "MB", "MiB", "Mi", "mi"], 1.0e+6
            ],
            [
                ["Gb"], 1.25e+8
            ],
            [
                ["g", "G", "gb", "GB", "GiB", "Gi", "gi"], 1.0e+9
            ],
            [
                ["Tb"], 1.25e+11
            ],
            [
                ["t", "T", "tb", "TB", "TiB", "Ti", "ti"], 1.0e+12
            ],
            [
                ["Pb"], 1.25e+14
            ],
            [
                ["p", "P", "pb", "PB", "PiB", "Pi", "pi"], 1.0e+15
            ],
            [
                ["Eb"], 1.25e+17
            ],
            [
                ["e", "E", "eb", "EB", "EiB", "Ei", "ei"], 1.0e+18
            ]
        ]
    }

    var options = arguments[1] || {};
    var base = parseInt(options.base || 2);

    var parsed = input.toString().match(/^([0-9\.,]*)(?:\s*)?(.*)$/);
    var amount = parsed[1].replace(',', '.');
    var unit = parsed[2];

    var validUnit = function (sourceUnit) {
        return sourceUnit === unit;
    };

    if (!validAmount(amount) || !parsableUnit(unit)) {
        return false
    }
    if (unit === '') return Math.round(Number(amount));

    var increments = incrementBases[base];
    for (var i = 0; i < increments.length; i++) {
        var _increment = increments[i];

        if (_increment[0].some(validUnit)) {
            return Math.round(amount * _increment[1]);
        }
    }

    throw unit + ' doesn\'t appear to be a valid unit';
}

export function escapeRegExp(string) {
    return string.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&')
}

export function toUpper(query) {
    const arr = query.split(" ")
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
    }

    return arr.join(" ")
}