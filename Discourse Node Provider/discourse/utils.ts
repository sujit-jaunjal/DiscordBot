type HasDiscourseNodeObjectType = {
    [key: string]: string | number | boolean | Object

    // This field specifies whether the user has access to Discourse
    hasDiscourse: boolean
  }

  type UserInfoNodeObjectType = {
    [key: string]: string | number | boolean | Object

    // This field contains the details of the current logged-in user
    currentUser: {
      id: number
      username: string
      email: string
      name: string
    }
  }

/**
   * Parse the HTML response for the Discourse provider
   * Note: the classes and ids may seem arbitrary,
   * but they are the only way to select the correct nodes
   */

export function parseResponse(html: string) {
	const hasDiscourseObject = parseHasDiscourseNode(html)
	const userInfoObject = parseUserInfoNode(html)

	return {
		hasDiscourseObject,
		userInfoObject
	}
}

function parseHasDiscourseNode(html: string): HasDiscourseNodeObjectType {
	const matches = [...html.matchAll(/"has_discourse":true/g)].map(value => value.index)

	if(matches.length !== 1) {
		throw new Error('Invalid login')
	}

	return { hasDiscourse: true }
}

const userRegexp = /<script type="text\/x-discourse-user" data-user="{&quot;id&quot;:\d+.*?}/g

function parseUserInfoNode(html: string): UserInfoNodeObjectType {
	const matches = html.match(userRegexp)

	if(matches?.length !== 1) {
		throw new Error('Invalid login')
	}

	const userObj = JSON.parse(matches[0].replace('&quot;', '"'))

	return { currentUser: { id: userObj.id, username: userObj.username, email: userObj.email, name: userObj.name } }
}