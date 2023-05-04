import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface userInfoState {
  username: string | undefined
  cookieStr: string | undefined
}

const initialState: userInfoState = {
	cookieStr: undefined,
	username: undefined,
}

const userInfoSlice = createSlice({
	name: 'userInfo',
	initialState,
	reducers: {
		setUserInfo: (state, action: PayloadAction<userInfoState>) => ({
			...state,
			...action.payload,
		}),
	},
})

export const { setUserInfo } = userInfoSlice.actions
export default userInfoSlice.reducer
