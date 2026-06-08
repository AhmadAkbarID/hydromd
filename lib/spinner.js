var spin = require('spinnies');

var spinner = {
    "interval": 20,
    "frames": [
        "",
        "Me",
        "Men",
        "Menu",
        "Menun",
        "Menung",
        "Menungg",
        "Menunggu",
        "Menunggu P",
        "Menunggu Pe",
        "Menunggu Pes",
        "Menunggu Pesa",
        "Menunggu Pesan",
        "Menunggu Pesan B",
        "Menunggu Pesan Ba",
        "Menunggu Pesan Bar",
        "Menunggu Pesan Baru",
        ""
    ]
};

let globalSpinner;

var getGlobalSpinner = (disableSpins = false) => {
    if (!globalSpinner) globalSpinner = new spin({ color: 'blue', succeedColor: 'blue', spinner, disableSpins });
    return globalSpinner;
};

let spins = getGlobalSpinner(false);

module.exports.start = (id, text) => {
    spins.add(id, { text: text });
};
