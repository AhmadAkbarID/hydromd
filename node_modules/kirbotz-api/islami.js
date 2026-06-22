const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs')
const fetch = require('node-fetch')
const got = require('got')
const util = require('util')
const yts = require('yt-search')
const ytdl = require('ytdl-core')
const author = "Akira"

async function asmaulhusna() {
var rndm = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99']
var bykir = rndm[Math.floor(Math.random() * rndm.length)]
   return new Promise( async (resolve, reject) => {
       const scraper = JSON.parse(fs.readFileSync(`./database/asmaulHusna/${bykir}.json`))
       console.log(scraper)
       const result = {
         author: author,
         nomor: scraper.number,
         latin: scraper.latin,
         arabic: scraper.arab,
         id: scraper.translate_id,
         en: scraper.translate_en
       }
       resolve(result)
   }).catch((err) => {resolve(err) })
}

async function ayatkursi() {
   return new Promise( async (resolve, reject) => {
       const scraper = JSON.parse(fs.readFileSync(`./database/ayatKursi/ayatkursi.json`))
       console.log(scraper)
       const result = {
         author: author,
         nomor: scraper.no,
         tafsir: scraper.tafsir,
         arabic: scraper.arabic,
         latin: scraper.latin,
         translate: scraper.translation
       }
       resolve(result)
   }).catch((err) => {resolve(err) })
}

async function bacaanshalat() {
var rndm = ['1','2','3','4','5','6','7','8']
var bykir = rndm[Math.floor(Math.random() * rndm.length)]
   return new Promise( async (resolve, reject) => {
       const scraper = JSON.parse(fs.readFileSync(`./database/bacaanSholat/${bykir}.json`))
       console.log(scraper)
       const result = {
         author: author,
         nomor: scraper.no,
         name: scraper.name,
         arabic: scraper.arabic,
         latin: scraper.latin,
         terjemahan: scraper.terjemahan
       }
       resolve(result)
   }).catch((err) => {resolve(err) })
}

async function doaharian() {
var rndm = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35']
var bykir = rndm[Math.floor(Math.random() * rndm.length)]
   return new Promise( async (resolve, reject) => {
       const scraper = JSON.parse(fs.readFileSync(`./database/doaHarian/${bykir}.json`))
       console.log(scraper)
       const result = {
         author: author,
         nomor: scraper.no,
         title: scraper.title,
         arabic: scraper.arabic,
         latin: scraper.latin,
         translate: scraper.translation
       }
       resolve(result)
   }).catch((err) => {resolve(err) })
}

module.exports.asmaulHusna = asmaulhusna
module.exports.ayatKursi = ayatkursi
module.exports.bacaanShalat = bacaanshalat
module.exports.doaHarian = doaharian