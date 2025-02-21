pipeline {
    agent any

    stages {
        stage('Install dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }

        stage('Unit Test') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }

        stage('Build application') {
            steps {
                script {
                    sh 'npm run build-dev'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
