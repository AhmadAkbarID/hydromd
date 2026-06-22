const senna = require("./")

async function test() {
  try {
    let res = await senna.igstalk("fg.error")
    console.log(res)
  } catch (e) {
    console.error(e)
  }
}

test()