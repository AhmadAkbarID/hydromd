const axios = require('axios')
const cheerio = require('cheerio')

async function tiktokv3(url) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = []
			function formatNumber(integer) {
				let numb = parseInt(integer)
				return Number(numb).toLocaleString().replace(/,/g, '.')
			}

			function formatDate(n, locale = 'en') {
				let d = new Date(Number(n) * 1000)
				return d.toLocaleDateString(locale, {
					weekday: 'long',
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					second: 'numeric'
				})
			}

			async function expandTikTokUrl(u) {
				if (!/https?:\/\/(vt|vm)\.tiktok\.com\//i.test(u)) return u
				const r = await axios.get(u, {
					maxRedirects: 10,
					timeout: 20000,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
						'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
					},
					validateStatus: s => s >= 200 && s < 400
				})
				return r?.request?.res?.responseUrl || u
			}

			async function tikwmFetch(form, attempt = 1) {
				try {
					const r = await axios.post('https://www.tikwm.com/api/', form.toString(), {
						timeout: 45000,
						headers: {
							'Accept': 'application/json, text/javascript, */*; q=0.01',
							'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'Origin': 'https://www.tikwm.com',
							'Referer': 'https://www.tikwm.com/',
							'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
							'X-Requested-With': 'XMLHttpRequest',
							'Connection': 'keep-alive'
						},
						validateStatus: () => true
					})
					if (r.status >= 500) throw new Error(`Request failed with status code ${r.status}`)
					return r.data
				} catch (e) {
					const msg = String(e && e.message ? e.message : e)
					const retriable =
						msg.includes('timeout') ||
						msg.includes('ECONNRESET') ||
						msg.includes('ETIMEDOUT') ||
						msg.includes('EAI_AGAIN') ||
						msg.includes('502') ||
						msg.includes('503') ||
						msg.includes('504')

					if (attempt < 6 && retriable) {
						const jitter = Math.floor(Math.random() * 600)
						await new Promise(res => setTimeout(res, 700 * attempt + jitter))
						return tikwmFetch(form, attempt + 1)
					}
					throw e
				}
			}

			const expanded = await expandTikTokUrl(url)
			const form = new URLSearchParams({
				url: expanded,
				count: 12,
				cursor: 0,
				web: 1,
				hd: 1
			})

			let payload
			try {
				payload = await tikwmFetch(form)
			} catch (e) {
				payload = null
			}

			let res = payload && payload.data ? payload.data : null
			if (!res) {
				try {
					const r2 = await tiktokv2(expanded)
					if (r2 && r2.status) return resolve({ status: true, source: 'savetik', ...r2 })
					return resolve({ status: false, msg: (payload && payload.msg) ? payload.msg : (r2 && r2.msg ? r2.msg : 'Tikwm error') })
				} catch (e) {
					return resolve({ status: false, msg: (payload && payload.msg) ? payload.msg : e.message })
				}
			}

			if (res?.duration == 0) {
				res.images.map(v => {
					data.push({ type: 'photo', url: v })
				})
			} else {
				data.push({
					type: 'watermark',
					url: res?.wmplay ? 'https://www.tikwm.com' + res.wmplay : '/undefined'
				}, {
					type: 'nowatermark',
					url: res?.play ? 'https://www.tikwm.com' + res.play : '/undefined'
				}, {
					type: 'nowatermark_hd',
					url: res?.hdplay ? 'https://www.tikwm.com' + res.hdplay : '/undefined'
				})
			}

			let json = {
				status: true,
				title: res.title,
				taken_at: formatDate(res.create_time),
				region: res.region,
				id: res.id,
				durations: res.duration,
				duration: res.duration + ' Seconds',
				cover: res.cover ? 'https://www.tikwm.com' + res.cover : null,
				size_wm: res.wm_size,
				size_nowm: res.size,
				size_nowm_hd: res.hd_size,
				data: data,
				music_info: {
					id: res.music_info.id,
					title: res.music_info.title,
					author: res.music_info.author,
					album: res.music_info.album ? res.music_info.album : null,
					url: res.music ? 'https://www.tikwm.com' + res.music : res.music_info.play
				},
				stats: {
					views: formatNumber(res.play_count),
					likes: formatNumber(res.digg_count),
					comment: formatNumber(res.comment_count),
					share: formatNumber(res.share_count),
					download: formatNumber(res.download_count)
				},
				author: {
					id: res.author.id,
					fullname: res.author.unique_id,
					nickname: res.author.nickname,
					avatar: res.author.avatar ? 'https://www.tikwm.com' + res.author.avatar : null
				}
			}
			resolve(json)
		} catch (e) {
			resolve({ status: false, msg: e.message })
		}
	})
}

async function tiktokv2(url) {
	try {
		const body = new URLSearchParams({
			q: url,
			cursor: "0",
			page: "0",
			lang: "id"
		}).toString()

		const r = await axios.post(
			'https://savetik.io/api/ajaxSearch',
			body,
			{
				timeout: 45000,
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'x-requested-with': 'XMLHttpRequest',
					'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
					'origin': 'https://savetik.io',
					'referer': 'https://savetik.io/id/download-tiktok-photos',
					'accept': '*/*'
				}
			}
		)

		const html = typeof r.data.data === "string" ? r.data.data : null
		if (!html) throw new Error('No HTML returned')

		const $ = cheerio.load(html)

		const mp4 =
			$('a:contains("Unduh MP4 [1]")').attr("href") ||
			$('a:contains("Unduh MP4 [2]")').attr("href") ||
			$('a:contains("Unduh MP4 HD")').attr("href") ||
			null

		const mp3 = $('a:contains("Unduh MP3")').attr("href") || null

		const images = []
		$(".photo-list ul.download-box li").each((_, el) => {
			const img = $(el).find("a[title='Unduh Gambar']").attr("href")
			if (img) images.push(img)
		})

		if (!mp4 && images.length === 0) {
			throw new Error("Media tidak ditemukan")
		}

		return {
			status: true,
			source: 'savetik_v2',
			title: $('h3').first().text().trim() || '',
			data: images.length > 0
				? images.map(v => ({ type: 'photo', url: v }))
				: [{ type: 'nowatermark', url: mp4 }],
			music_info: mp3 ? { url: mp3 } : null,
			author: { nickname: '' },
			stats: { views: '0', likes: '0', comment: '0', share: '0' }
		}

	} catch (e) {
		return { status: false, msg: e.message }
	}
}

async function tiktokv1(url) {
	try {
		async function expandTikTokUrl(u) {
			if (!/https?:\/\/(vt|vm)\.tiktok\.com\//i.test(u)) return u
			const r = await axios.get(u, {
				maxRedirects: 10,
				timeout: 20000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Linux; Android 10) Chrome/120 Mobile Safari/537.36',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
				},
				validateStatus: s => s >= 200 && s < 400
			})
			return r?.request?.res?.responseUrl || u
		}

		const expanded = await expandTikTokUrl(url)

		const baseHeaders = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			Origin: 'https://savett.cc',
			Referer: 'https://savett.cc/en1/download',
			'User-Agent': 'Mozilla/5.0 (Linux; Android 10) Chrome/139.0.0.0 Mobile Safari/537.36'
		}

		const page = await axios.get('https://savett.cc/en1/download', {
			timeout: 30000,
			headers: { ...baseHeaders },
			validateStatus: () => true
		})
		if (page.status >= 400) throw new Error(`savett page error: ${page.status}`)

		const csrf = page.data?.match(/name="csrf_token" value="([^"]+)"/)?.[1]
		const setCookie = page.headers?.['set-cookie'] || []
		const cookie = Array.isArray(setCookie)
			? setCookie.map(v => v.split(';')[0]).join('; ')
			: ''

		if (!csrf) throw new Error('CSRF token tidak ditemukan (savett)')

		const body = `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(expanded)}`
		const post = await axios.post('https://savett.cc/en1/download', body, {
			timeout: 45000,
			headers: { ...baseHeaders, Cookie: cookie },
			validateStatus: () => true
		})
		if (post.status >= 400) throw new Error(`savett post error: ${post.status}`)

		const $ = cheerio.load(post.data)

		const statsArr = []
		$('#video-info .my-1 span').each((_, el) => statsArr.push($(el).text().trim()))

		const username = $('#video-info h3').first().text().trim() || ''
		const durationText = $('#video-info p.text-muted').first().text().replace(/Duration:/i, '').trim()

		const out = {
			status: true,
			source: 'savett_v3',
			title: '',
			duration: durationText || '',
			type: null,
			data: [],
			music_info: null,
			stats: {
				views: statsArr[0] || '0',
				likes: statsArr[1] || '0',
				comment: statsArr[3] || '0',
				share: statsArr[4] || '0'
			},
			author: {
				nickname: username || ''
			}
		}

		const slides = $('.carousel-item[data-data]')
		if (slides.length) {
			out.type = 'photo'
			const imgs = []
			slides.each((_, el) => {
				try {
					const raw = $(el).attr('data-data')
					if (!raw) return
					const json = JSON.parse(raw.replace(/&quot;/g, '"'))
					if (Array.isArray(json?.URL)) imgs.push(...json.URL)
				} catch { }
			})
			if (!imgs.length) throw new Error('Slide photo tidak ditemukan (savett)')
			out.data = imgs.map(v => ({ type: 'photo', url: v }))
			return out
		}

		out.type = 'video'
		const nowm = []
		const wm = []
		const mp3 = []

		$('#formatselect option').each((_, el) => {
			const label = ($(el).text() || '').toLowerCase()
			const raw = $(el).attr('value')
			if (!raw) return
			try {
				const json = JSON.parse(raw.replace(/&quot;/g, '"'))
				const urls = Array.isArray(json?.URL) ? json.URL : []
				if (!urls.length) return

				if (label.includes('mp4') && !label.includes('watermark')) nowm.push(...urls)
				if (label.includes('watermark')) wm.push(...urls)
				if (label.includes('mp3')) mp3.push(...urls)
			} catch { }
		})

		const videoUrl = nowm[0] || wm[0]
		if (!videoUrl) throw new Error('Video tidak ditemukan (savett)')

		if (wm[0]) out.data.push({ type: 'watermark', url: wm[0] })
		if (nowm[0]) out.data.push({ type: 'nowatermark', url: nowm[0] })
		if (!nowm[0]) out.data.push({ type: 'nowatermark', url: videoUrl })

		if (mp3[0]) out.music_info = { url: mp3[0] }

		return out

	} catch (e) {
		return { status: false, msg: e.message }
	}
}

async function tiktokDl(url) {
	const v1 = await tiktokv1(url)
	if (v1 && v1.status) return v1

	const v2 = await tiktokv2(url)
	if (v2 && v2.status) return v2

	const v3 = await tiktokv3(url)
	if (v3 && v3.status) return v3

	return {
		status: false,
		msg: 'Semua server downloader gagal.'
	}
}

module.exports = { tiktokv1, tiktokv2, tiktokv3, tiktokDl }