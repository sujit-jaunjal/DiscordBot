import userInfoReducer from '@app/providers/discourse/redux/userInfo/index'
import { combineReducers } from 'redux'

const discourseReducer = combineReducers({
	userInfo: userInfoReducer,
})

export default discourseReducer
