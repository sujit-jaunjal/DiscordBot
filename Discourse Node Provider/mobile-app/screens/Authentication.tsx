import React from 'react'
import { WebView } from 'react-native-webview'
import { getCookies } from '@app/lib/utils/helpers'
import { setUserInfo } from '@app/providers/discourse/redux/userInfo'
import { ProvidersStackScreenProps } from '@app/providers/navigation'
import { useReduxDispatch } from '@app/redux/config'

type Props = ProvidersStackScreenProps<'discourse', 'Authentication'>;

const DISCOURSE_URL = 'https://forum.apecoin.com/'

const LOGGED_IN_TXT = 'logged-in'

const injection = `
  function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
      begin = dc.indexOf(prefix);
      if (begin != 0) return null;
    }
    else {
      begin += 2;
      var end = document.cookie.indexOf(";", begin);
      if (end == -1) {
        end = dc.length;
      }
    }
    return decodeURIComponent(dc.substring(begin + prefix.length, end));
  }

  const cookieCheckInterval = setInterval(() => {
    const csrfCookie = getCookie('_forum_session');
    if (csrfCookie) {
      window.ReactNativeWebView.postMessage('${LOGGED_IN_TXT}')
      clearInterval(cookieCheckInterval);
    }
  }, 100);
  true; // note: this is required, or you'll sometimes get silent failures
`

const Authentication: React.FC<Props> = ({ navigation, route }) => {
	const { returnScreen } = route.params
	const dispatch = useReduxDispatch()

	const onCookiesExtracted = async(username: string, cookieStr: string) => {
		dispatch(setUserInfo({ username, cookieStr }))
		navigation.navigate(...returnScreen)
	}

	return (
		<>
			<WebView
				source={{ uri: DISCOURSE_URL }}
				injectedJavaScript={injection}
				thirdPartyCookiesEnabled={true}
				onMessage={
					async() => {
						try {
							const res = await getCookies(DISCOURSE_URL)
							const userId = 'Authenticating...'
							const cookieStr = Object.values(res)
								.map((c) => `${c.name}=${c.value}`)
								.join('; ')
							onCookiesExtracted(userId, cookieStr)
						} catch(error) {
							// eslint-disable-next-line no-console
							console.log('error getting cookies: ', error)
						}
					}
				}
			/>
		</>
	)
}

export default Authentication
