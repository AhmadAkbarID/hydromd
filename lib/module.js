const { uriTooLong } = require("@hapi/boom");
const { createClient } = require("@supabase/supabase-js");

module.exports = {
    modul: {
        axios: require("axios"),
        baileys: require("socketon"),
        boom: require("@hapi/boom"),
        chalk: require("chalk"),
        util: require("util"),
        exec: require("child_process").exec,
        crypto: require("crypto"),
        performance: require("perf_hooks").performance,
        fs: require("fs"),
        figlet: require("figlet"),
        FileType: require("file-type"),
        moment: require('moment-timezone'),
        os: require("os"),
        yts: require("yt-search"),
        path: require("path"),
        pino: require("pino"),
        process: require("process"),
        PhoneNumber: require("awesome-phonenumber"),
        yargs: require("yargs"),
        QuickChart: require("quickchart-js"),
        _: require("lodash")
    }
}