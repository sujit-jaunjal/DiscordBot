import { gunzipSync } from 'zlib'
import { DEFAULT_PORT, Provider } from '../../types'
import { getCompleteHttpResponseFromTranscript, getHttpRequestHeadersFromTranscript } from '../../utils/http-parser'

type DiscourseLoginParams = {
  username: string
};

type DiscourseLoginSecretParams = {
  cookieStr: string
};

const HOST = 'forum.apecoin.com'
const HOSTPORT = `${HOST}:${DEFAULT_PORT}`

var PATH = ''

const DiscourseLogin: Provider<DiscourseLoginParams, DiscourseLoginSecretParams> = {
	hostPort: HOSTPORT,
	areValidParams(params): params is DiscourseLoginParams {
		return (
			typeof params.username === 'string' &&
      params.username.length > 0
		)
	},
	createRequest({ cookieStr }, { username }) {
		PATH = `/u/${username}/summary.json`

		const strRequest = [
			`GET ${PATH} HTTP/1.1`,
			'Host: ' + HOST,
			`cookie: ${cookieStr}`,
			// 'User-Agent: discourse-auth/1.0.0',
			'Accept-Encoding: gzip, deflate',
			'\r\n',
		].join('\r\n')
		const data = Buffer.from(strRequest)
		const cookieStartIndex = data.indexOf(cookieStr)
		return {
			data,
			redactions: [
				{
					fromIndex: cookieStartIndex,
					toIndex: cookieStartIndex + cookieStr.length
				},
			],
		}
	},
	assertValidProviderReceipt(receipt, { username }) {
		if(receipt.hostPort !== HOSTPORT) {
			throw new Error('Invalid hostPort: ${receipt.hostPort}')
		}

		const req = getHttpRequestHeadersFromTranscript(receipt.transcript)
		if(req.method !== 'get') {
			throw new Error('Invalid method: ${req.method}')
		}

		if(req.url !== PATH) {
			throw new Error('Invalid path: ${req.url}')
		}

		const res = getCompleteHttpResponseFromTranscript(receipt.transcript)
		if(res.statusCode !== 200) {
			throw new Error('Login failed')
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let json: any
		if(res.headers['content-encoding'] === 'gzip') {
			const buf = Buffer.from(res.body)
			json = JSON.parse(gunzipSync(buf).toString())
		} else {
			json = JSON.parse(res.body.toString())
		}

		if(json.error_type) {
			if(json.error_type === 'not_found') {
				throw new Error('The requested URL or resource could not be found.')
			}
		  }

		if(!json.users.find(x => x.username === username)) {
			throw new Error(`Login failed: ${json.message}`)
		  }

		if(!json.valueOf()) {
			throw new Error('The requested URL or resource could not be found.')
		}
	}
}

export default DiscourseLogin