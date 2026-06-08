const cheerio = require('cheerio');
const cookie = "PHPSESSID=dhl6jce6sehkf2nniogei5fcb2; __gads=ID=5b4843e6a7347e69:T=1723742092:RT=1724139071:S=ALNI_MY_Aw7lonCiv1TAknXGwojUnRfS5A; __gpi=UID=00000ebfad8dc4a6:T=1723742092:RT=1724139071:S=ALNI_MZcW1-oCkFI-FZQnBVLesP3qyRJUA; __eoi=ID=9617765c6bf91c5f:T=1723742092:RT=1724139071:S=AA-Afjalp7nqEbonITTKkl8oPi3F; _ga=GA1.1.21528983.1723742050; _ga_7FPT6S72YE=GS1.1.1724138986.2.1.1724139133.0.0.0; FCNEC=%5B%5B%22AKsRol9TbDPZGZfYcAZaTI6jGucM2znpb3DnAHR5IUTS9hEUROEMJ93jTcQw7oj2rhnslz-HdW2HGYvIRvOHitWxsWw2ysFVncxSx_7wD9tDdiKqk3HEyKmnuejd99plqelofDiSrwOVTirVcQdXMHKx6EAadg-4sA%3D%3D%22%5D%5D"
const fetch = require('node-fetch');
const FormData = require('form-data');

async function post(url, formdata = {},) {
  let encode = encodeURIComponent;
  let body = Object.keys(formdata)
    .map((key) => {
      let vals = formdata[key];
      let isArray = Array.isArray(vals);
      let keys = encode(key + (isArray ? "[]" : ""));
      if (!isArray) vals = [vals];
      let out = [];
      for (let valq of vals) out.push(keys + "=" + encode(valq));
      return out.join("&");
    })
    .join("&");
  return await fetch(`${url}?${body}`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "GoogleBot",
      Cookie: "PHPSESSID=dhl6jce6sehkf2nniogei5fcb2; __gads=ID=5b4843e6a7347e69:T=1723742092:RT=1724139071:S=ALNI_MY_Aw7lonCiv1TAknXGwojUnRfS5A; __gpi=UID=00000ebfad8dc4a6:T=1723742092:RT=1724139071:S=ALNI_MZcW1-oCkFI-FZQnBVLesP3qyRJUA; __eoi=ID=9617765c6bf91c5f:T=1723742092:RT=1724139071:S=AA-Afjalp7nqEbonITTKkl8oPi3F; _ga=GA1.1.21528983.1723742050; _ga_7FPT6S72YE=GS1.1.1724138986.2.1.1724139133.0.0.0; FCNEC=%5B%5B%22AKsRol9TbDPZGZfYcAZaTI6jGucM2znpb3DnAHR5IUTS9hEUROEMJ93jTcQw7oj2rhnslz-HdW2HGYvIRvOHitWxsWw2ysFVncxSx_7wD9tDdiKqk3HEyKmnuejd99plqelofDiSrwOVTirVcQdXMHKx6EAadg-4sA%3D%3D%22%5D%5D",
    },
  });
}

async function textpro(url, text) {
  if (!/^https:\/\/textpro\.me\/.+\.html$/.test(url))
    throw new Error("Url Salah!!");
  
  const geturl = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "GoogleBot",
    },
  });
  
  const caritoken = await geturl.text();
  
  let setCookieHeader = geturl.headers.get("set-cookie");

  if (!setCookieHeader) {
    throw new Error("No set-cookie header found");
  }

  let hasilcookie = setCookieHeader
    .split(",")
    .map((v) => cookie.parse(v))
    .reduce((a, c) => {
      return { ...a, ...c };
    }, {});

  hasilcookie = {
    __cfduid: hasilcookie.__cfduid,
    PHPSESSID: hasilcookie.PHPSESSID,
  };
  
  hasilcookie = Object.entries(hasilcookie)
    .map(([name, value]) => cookie.serialize(name, value))
    .join("; ");
  
  const $ = cheerio.load(caritoken);
  const token = $('input[name="token"]').attr("value");
  const form = new FormData();
  
  if (typeof text === "string") text = [text];
  for (let texts of text) form.append("text[]", texts);
  
  form.append("submit", "Go");
  form.append("token", token);
  form.append("build_server", "https://textpro.me");
  form.append("build_server_id", 1);
  
  const geturl2 = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "GoogleBot",
      Cookie: hasilcookie,
      ...form.getHeaders(),
    },
    body: form.getBuffer(),
  });
  
  const caritoken2 = await geturl2.text();
  const token2 = /<div.*?id="form_value".+>(.*?)<\/div>/.exec(caritoken2);
  
  if (!token2) throw new Error("Token Not Found!!");
  
  const prosesimage = await post(
    "https://textpro.me/effect/create-image",
    JSON.parse(token2[1]),
    hasilcookie
  );
  
  const hasil = await prosesimage.json();
  return `https://textpro.me${hasil.fullsize_image}`;
}

module.exports.textpro = textpro;