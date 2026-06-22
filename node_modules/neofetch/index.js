const { exec } = require('child_process');
const { resolve } = require('path');

module.exports = async () => {
	const bufs = [];
	let cb;
	let p = new Promise((r) => (cb = r));
	const child = exec(resolve(__filename, '..', 'neofetch'), cb);
	child.stdout.on('data', (c) => bufs.push(Buffer.from(c)));
	child.stderr.on('data', (c) => bufs.push(Buffer.from(c)));
	await p;
	return Buffer.concat(bufs);
};
