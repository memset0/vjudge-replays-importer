const fs = require('fs');
const xlsx = require('node-xlsx');

const lib = {
	cf: require('./spider/cf_contest'),
	gym: require('./spider/cf_gym'),
};

async function dump(oj, id, dir) {
	if (!dir.endsWith('.xlsx')) {
		dir += '.xlsx';
	}
	const data = await lib[oj].crawl(id);
	fs.writeFileSync(dir, xlsx.build([{ name: `${oj} - ${id}`, data }]));
}

if (require.main == module) {
	dump('gym', 102770, '浙大校赛');
}