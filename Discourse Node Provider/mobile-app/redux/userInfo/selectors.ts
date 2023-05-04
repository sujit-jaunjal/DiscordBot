/**
 * @fileoverview Selectors for the Discourse user info state.
 */
import { getDiscourse } from '@app/providers/discourse/redux/selectors'
import { RootState } from '@app/redux/config'

export const getUserInfo = (state: RootState) => getDiscourse(state).userInfo

export const getUsername = (state: RootState) => getUserInfo(state).username

export const getUserIdString = (state: RootState) => getUsername(state)?.toString()