require('../settings');
const fs = require('fs');
const jimp = require('jimp');
const chalk = require('chalk');

const gameSlot = async (hydro, m, db, nominalArg) => {
  db.users = db.users || {}
  db.users[m.sender] = db.users[m.sender] || { limit: 0, money: 0 }

  const user = db.users[m.sender]

  if ((user.limit || 0) < 1) return m.reply(global.mess?.limit || 'Limit kamu habis.')

  const parseNominal = (input) => {
    if (!input) return NaN
    let s = String(input).trim().toLowerCase()

    s = s.replace(/[^0-9k.,]/g, '')

    const isK = s.endsWith('k')
    s = s.replace(/k/g, '')

    s = s.replace(/[.,]/g, '')

    let n = parseInt(s, 10)
    if (!Number.isFinite(n)) return NaN
    if (isK) n *= 1000
    return n
  }

  const nominal = parseNominal(nominalArg)
  if (!Number.isFinite(nominal) || nominal < 1) {
    return m.reply(
      `Gunakan: *slot [nominal]*\nContoh:\n- *slot 500*\n- *slot 10k*\n- *slot 10.000*`
    )
  }

  if ((user.money || 0) < nominal) return m.reply('Uang kamu tidak cukup untuk taruhan itu.')

  const symbols = ['🍇','🍉','🍋','🍌','🍎','🍑','🍒','🫐','🥥','🥑']

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const spin = Array.from({ length: 9 }, () => pickRandom(symbols))

  const row1 = `${spin[0]} : ${spin[1]} : ${spin[2]}`
  const row2 = `${spin[3]} : ${spin[4]} : ${spin[5]}`
  const row3 = `${spin[6]} : ${spin[7]} : ${spin[8]}`

  user.limit -= 1
  user.money -= nominal

  const randomLimit = Math.floor(Math.random() * 10) + 1

  let ket = 'You Lose'
  let hadiahUang = 0
  let hadiahLimit = 0

  const allSame = spin.every(v => v === spin[0])
  const midSame = spin[3] === spin[4] && spin[4] === spin[5]
  const topSame = spin[0] === spin[1] && spin[1] === spin[2]
  const botSame = spin[6] === spin[7] && spin[7] === spin[8]

  if (allSame) {
    ket = 'JACKPOT BESAR 🎉'
    hadiahUang = nominal * 5
    hadiahLimit = randomLimit
  } else if (midSame) {
    ket = 'JACKPOT 🎉'
    hadiahUang = nominal * 3
    hadiahLimit = randomLimit
  } else if (topSame || botSame) {
    ket = 'Menang Kecil ✨'
    hadiahUang = nominal * 2
    hadiahLimit = Math.max(1, Math.floor(randomLimit / 2))
  }

  if (hadiahUang > 0) user.money += hadiahUang
  if (hadiahLimit > 0) user.limit += hadiahLimit

  const text =
`[  🎰 VIRTUAL SLOT 🎰  ]
------------------------

${row1}
${row2}  <=====
${row3}

------------------------
*Keterangan* :
${ket} ${hadiahUang > 0 ? `\nUang + ${hadiahUang}\nLimit + ${hadiahLimit}` : `\nUang - ${nominal}\nLimit - 1`}`

  return hydro.sendMessage(m.chat, { text }, { quoted: m })
}

module.exports = {
	gameSlot
}