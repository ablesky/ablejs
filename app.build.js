({
	"allConfigurationOptionsUrl": "https://github.com/jrburke/r.js/blob/master/build/example.build.js",
	"baseUrl": "js",
	"dir": "js_optimize",
	"optimize": "uglify2",
	"useSourceUrl": true,
	"generateSourceMaps": true,
	"preserveLicenseComments": false,
	"rawText": {
		"jquery": ""
	},
	"findNestedDependencies": true,
	"modules": [{
		"name": "index/index-init",
		"exclude": ["common/global"]
	}],
	"onBuildRead": function(moduleName, path, contents) {
		//Always return a value.
		//This is just a contrived example.
		console.log(moduleName);
		if (moduleName == 'common/global') {
		}
		return contents;
	}
})

