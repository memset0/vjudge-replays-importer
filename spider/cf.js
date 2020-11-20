const cheerio = require('cheerio');
const superagent = require('superagent');

const site_root = 'https://codeforces.ml'; // only available in China
// const site_root = 'https://codeforces.com';

async function crawl(contest_type, contest_id, page = 1) {
	contest_type = contest_type == 'cf' ? 'contest' : contest_type;
	contest_id = String(contest_id);
	let standings_link = site_root + `/${contest_type}/${contest_id}/standings`;
	if (page > 1) {
		standings_link += `/page/${page}`;
	}
	console.log('crawling...', standings_link);

	const response = await superagent.get(standings_link);
	const html_plain = response.text;
	const $ = cheerio.load(html_plain);

	let result = [];
	$('.datatable .standings tr').each((index, element) => {
		if (!index || $(element).hasClass('standingsStatisticsRow')) {
			return;
		}

		const name = $(element).children('td').eq(1).text().trim();
		let data = [name];

		$(element).children('td').each((index, element) => {
			if (index <= 3) return;
			const cell_time = $(element).children('.cell-time').text().trim();
			const cell_accepted = $(element).children('.cell-accepted').text().trim();
			const cell_rejected = $(element).children('.cell-rejected').text().trim();

			if (cell_accepted) {
				const tried_times = cell_accepted == '+' ? 1 : parseInt(cell_accepted.slice(1)) + 1;
				const passed_time = parseInt(cell_time.split(':')[0]) * 60 + parseInt(cell_time.split(':')[1]);
				data.push(tried_times + ' # ' + passed_time);
			} else if (cell_rejected) {
				const tried_times = parseInt(cell_rejected.slice(1));
				data.push(tried_times + ' # ' + '-');
			} else {
				data.push('');
			}
		});

		result.push(data);
	});

	if ($('.custom-links-pagination').length) {
		const total_page_number = $('.custom-links-pagination .page-index').length;
		if (page < total_page_number) {
			let following_result = await crawl(contest_type, contest_id, page + 1);
			result = result.concat(following_result);
		}
	}

	return result;
}

module.exports = { crawl };
if (require.main == module) {
	crawl('gym', '102832').then(console.log);
}