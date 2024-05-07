var Express = require('express');
// v2 api
var convertv2 = require('./lib/convertv2');
var serveStatic = require('serve-static');
var cors = require('cors');
var errorPage = require('./lib/errorPage');
var morgan = require('morgan');
var compression = require('compression')

var app = Express();

var logger = morgan(':method :url :status via :referrer - :response-time ms') 

app.use(compression());

app.use(
	serveStatic('static',{
		maxAge:'1d'
	})
);

function doCache(res,durationSecs){
	res.set({
		"Cache-Control":"max-age="+durationSecs
	})
}


// this just redirects to the v2 API
app.options('/api/feed',cors());
app.get('/api/feed',cors(),logger,function(req,res){

	// get feed url
	var feedUrl = req.query.url;
	if (!feedUrl){
		res.status(400);
		res.send(errorPage(400,'You need to specify a feed URL'));
		return;
	}

	var userUrl = feedUrl.replace(/\.atom.*/i,'');

	var redirectUrl = '/apiv2/feed?';
	var qs = ['userurl='+encodeURIComponent(userUrl),"api=v1"];

	(['size','theme','boosts','replies']).forEach(key=>{
		if (typeof req.query[key] != 'undefined'){
			qs.push(key+'='+encodeURIComponent(req.query[key]));
		}
	})

	res.redirect(redirectUrl + qs.join('&'));

});

app.options('/apiv2/feed',cors());
// http://localhost:8000/apiv2/feed?userurl=https%3A%2F%2Foctodon.social%2Fusers%2Ffenwick67
app.get('/apiv2/feed',cors(),logger,function(req,res){
	
	// get feed url
	var userUrl = req.query.userurl;
	if (!userUrl){
		res.status(400);
		res.send(errorPage(400,'You need to specify a user URL'));
		return;
	}

	var feedUrl = req.query.feedurl;

	var opts = {};
	if (req.query.size){
		opts.size = req.query.size;
	}
	if (req.query.theme){
		opts.theme = req.query.theme;
	}
	if (req.query.header){
		if (req.query.header.toLowerCase() == 'no' || req.query.header.toLowerCase() == 'false'){
			opts.header = false;
		}else{
			opts.header = true;
		}
	}

	opts.boosts = true;
	if (req.query.boosts){
		if (req.query.boosts.toLowerCase() == 'no' || req.query.boosts.toLowerCase() == 'false'){
			opts.boosts = false;
		}else{
			opts.boosts = true;
		}
	}

	opts.replies = true;
	if (req.query.replies){
		if (req.query.replies.toLowerCase() == 'no' || req.query.replies.toLowerCase() == 'false'){
			opts.replies = false;
		}else{
			opts.replies = true;
		}
	}
	opts.userUrl = userUrl;
	opts.feedUrl = feedUrl;
	opts.mastofeedUrl = req.url;

	convertv2(opts).then((data)=>{
		res.status(200);
		doCache(res,60*60);
		res.send(data);
	}).catch((er)=>{
		res.status(500);
		res.send(errorPage(500,null,{theme:opts.theme,size:opts.size}));
		// TODO log the error
		console.error(er,er.stack);
	})
})

// 新しいものから順に
const KMYBLUE_VERSIONS = [
	{ major: 12, minor: 0, urgent: false, urgent_cross_version: false, },
	{ major: 11, minor: 4, urgent: false, urgent_cross_version: false, },
	{ major: 11, minor: 3, urgent: false, urgent_cross_version: false, },
	{ major: 11, minor: 2, urgent: false, urgent_cross_version: false, },
	{ major: 11, minor: 1, urgent: true, urgent_cross_version: false, },
	{ major: 11, minor: 0, urgent: false, urgent_cross_version: false, },
	{ major: 10, minor: 5, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 10, minor: 4, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 10, minor: 3, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 10, minor: 2, urgent: false, urgent_cross_version: false, },
	{ major: 10, minor: 1, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 10, minor: 0, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 9, minor: 4, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 9, minor: 3, urgent: false, urgent_cross_version: false, },
	{ major: 9, minor: 2, urgent: false, urgent_cross_version: false, },
	{ major: 9, minor: 1, urgent: false, urgent_cross_version: false, },
	{ major: 9, minor: 0, urgent: false, urgent_cross_version: false, },
	{ major: 8, minor: 1, urgent: false, urgent_cross_version: false, },
	{ major: 8, minor: 0, urgent: true, urgent_cross_version: true, cross_by: 1, },  // cross_by: { major: 1, minor: 0 } にも対応
	{ major: 7, minor: 2, urgent: true, urgent_cross_version: false, },
	{ major: 7, minor: 1, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 7, minor: 0, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 6, minor: 1, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 6, minor: 0, urgent: false, urgent_cross_version: false, },
	{ major: 5, minor: 18, urgent: false, urgent_cross_version: false, },
	{ major: 5, minor: 17, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 16, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 15, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 14, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 13, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 12, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 11, urgent: false, urgent_cross_version: false, },
	{ major: 5, minor: 10, urgent: false, urgent_cross_version: false, },
	{ major: 5, minor: 9, urgent: false, urgent_cross_version: false, },
	{ major: 5, minor: 8, urgent: false, urgent_cross_version: false, },
	{ major: 5, minor: 7, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 6, urgent: true, urgent_cross_version: false, },
	{ major: 5, minor: 5, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 4, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 3, urgent: true, urgent_cross_version: true, cross_by: 1, },
	{ major: 5, minor: 2, urgent: true, urgent_cross_version: false, },
	{ major: 5, minor: 1, urgent: true, urgent_cross_version: false, },
	{ major: 5, minor: 0, urgent: false, urgent_cross_version: false, },
	{ major: 3, minor: 3, urgent: true, urgent_cross_version: true, },
];
// 新しいものから順に
const KMYBLUE_LTS_VERSIONS = [5];

app.options('/api/kb/update-check', cors());
app.get('/api/kb/update-check', cors(), logger, function(req, res) {
  const version = req.query.version || ('' + KMYBLUE_VERSIONS[0].major + '.' + KMYBLUE_VERSIONS[0].minor);
	const versionAvailableNumbers = version.split('-');
  const versionNumbers = versionAvailableNumbers[0].split('.');

	if (versionNumbers.length !== 2) {
		res.status(400);
		res.set({ "Content-Type": "text/plain" });
		res.send('malformed version');
		return;
	}

	const isDev = version.includes('-dev');
	const major = parseInt(versionNumbers[0]) - (isDev ? 1 : 0);
	const minor = isDev ? 999 : parseInt(versionNumbers[1]);

	if (isNaN(major) || major <= 0 || isNaN(minor) || minor < 0) {
		res.status(400);
		res.set({ "Content-Type": "text/plain" });
		res.send('malformed version');
		return;
	}

	const isLtsOnly = version.includes('-lts');
	const isNowLts = KMYBLUE_LTS_VERSIONS.includes(major);
	const availableVersions = [];

	const isOldOrPresentVersion = (version) => {
		if (typeof version === 'number') {
			return major >= version;
		} else if (typeof version === 'object') {
			return major === version.major ? minor >= version.minor : major >= version;
		} else {
			return false;
		}
	};

	const addVersion = (obj, isForce) => {
		if (obj.major < major || (obj.major === major && obj.minor <= minor)) {
			if (!isForce) {
				return;
			}
		}

		const historyVersions = KMYBLUE_VERSIONS
			.filter((v) => (v.major > major || (v.major === major && v.minor > minor)) && (obj.major > v.major || (obj.major === v.major && obj.minor >= v.minor)))
			.filter((v) => {
				if (isLtsOnly) {
					if (isNowLts) {
						return KMYBLUE_LTS_VERSIONS.includes(v.major);
					} else {
						const lastLts = KMYBLUE_LTS_VERSIONS[0];
						if (lastLts > major) {
							return v.major <= lastLts;
						} else {
							return true;
						}
					}
				} else {
					return true;
				}
			});

		const isLts = KMYBLUE_LTS_VERSIONS.includes(obj.major);
		const versionStr = `${obj.major}.${obj.minor}`;
		const versionFlag = isLts ? '-lts' : '';
		const type = (obj.major > major || isForce) ? 'major' : 'patch';
		const urgent = obj.major === major ? historyVersions.some((v) => v.urgent) : historyVersions.some((v) => v.urgent_cross_version && isOldOrPresentVersion(v.cross_by));

		if (!isLtsOnly || isNowLts || urgent) {
			availableVersions.push({
				'version': versionStr,
				urgent,
				type,
				releaseNotes: `https://github.com/kmycode/mastodon/releases/tag/kb${obj.major}.${obj.minor}${versionFlag}`,
			});
		}
	};

	if (isLtsOnly) {
		if (isNowLts) {
			const ver = KMYBLUE_VERSIONS.filter((v) => KMYBLUE_LTS_VERSIONS.includes(v.major))[0];
			addVersion(ver);
		} else {
			const lastLts = KMYBLUE_LTS_VERSIONS[0];
			if (lastLts > major) {
				const majors = KMYBLUE_VERSIONS.filter((v) => v.major <= lastLts).filter((v) => v.major === major ? v.urgent : (v.urgent_cross_version && isOldOrPresentVersion(v.cross_by))).map((v) => v.major);
				const ver = KMYBLUE_VERSIONS.filter((v) => v.major === majors[0])[0];
				addVersion(ver);
			} else {
				const majors = KMYBLUE_VERSIONS.filter((v) => v.major === major ? v.urgent : (v.urgent_cross_version && isOldOrPresentVersion(v.cross_by))).map((v) => v.major);
				const ver = KMYBLUE_VERSIONS.filter((v) => v.major === majors[0])[0];
				addVersion(ver);
			}
		}
	} else {
		const ver = KMYBLUE_VERSIONS[0];
		addVersion(ver, !req.query.version);
	}

	if (availableVersions.length === 0) {
		res.set({ "Content-Type": "application/json" });
		res.status(200);
		res.send({
			updatesAvailable: [],
		});
		return;
	}


	res.set({ "Content-Type": "application/json" });
	res.status(200);
	res.send({
		updatesAvailable: availableVersions,
	});
});

app.listen(process.env.PORT || 8000,function(){
	console.log('Server started, listening on '+(process.env.PORT || 8000));
});
