// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '600831333340241', // your App ID
		'clientSecret' 	: '40f868408004c85b0834a5422d63d037', // your App Secret
		'callbackURL' 	: 'http://www.normalquestions.com/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'zHQBbNfn7caJSmFucxtqWg',
		'consumerSecret' 	: 'ufA32h31ekFcArDtXKyQsXVBQWtDDbK1DdgKG4zAOCk',
		'callbackURL' 		: 'http://www.normalquestions.com/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '41120153991-dnf1v0oc8bs4ocvn6c4o8j34c84o7mh0.apps.googleusercontent.com',
		'clientSecret' 	: 'jGDuQbnZUY2QB8EAIEFO7cq4',
		'callbackURL' 	: 'http://www.normalquestions.com/google/callback'
	}

};