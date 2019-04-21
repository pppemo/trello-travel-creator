node {
	try {
		stage('Git checkout') {
		  git credentialsId: '7d48187e-6d17-4204-8eb0-0cb5696e29c2', url: 'http://github.com/pppemo/trello-travel-creator'
		}

		stage('Building package') {
			sh 'npm install && npm run build'
		}
	   
		stage('Deploy to production') {
			ftpPublisher alwaysPublishFromMaster: false, continueOnError: false, failOnError: false, publishers: [[configName: 'Devways @ MyDevil', transfers: [[asciiMode: false, cleanRemote: true, excludes: '', flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/travel.apps.devways.pl/public_html', remoteDirectorySDF: false, removePrefix: 'build', sourceFiles: 'build/']], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false]]
		}
	} finally {
		stage('Cleaning up') {
			deleteDir()
		}
	}
}
