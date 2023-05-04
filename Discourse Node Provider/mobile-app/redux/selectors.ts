import { PossibleClaimData } from '@app/providers'
import { getUserInfo } from '@app/providers/discourse/redux/userInfo/selectors'
import { getProviders } from '@app/providers/selectors'
import { RootState } from '@app/redux/config'

export const getDiscourse = (state: RootState) => getProviders(state).discourse

export const getDiscourseLoginParams: PossibleClaimData<'discourse'>['getParams'] = (
	state: RootState
) => {
	const uname = getUserInfo(state).username ?? ''

	return {
		username: uname,
	}
}

export const getDiscourseSecretParams: PossibleClaimData<'discourse'>['getSecretParams'] = (
	state: RootState
) => {
	const cookieStr = getUserInfo(state).cookieStr ?? ''

	return {
		cookieStr,
	}
}