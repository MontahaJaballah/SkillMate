pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://github.com/MontahaJaballah/SkillMate.git'
            }
        }

        stage('Install dependencies') {
            steps {
                script {
                    if (fileExists('package.json')) {
                        echo 'package.json found, installing dependencies...'
                        sh 'npm install'
                    } else {
                        echo 'package.json not found!'
                        error 'package.json is missing. Stopping pipeline.'
                    }
                }
            }
        }

        stage('Unit Test') {
            steps {
                script {
                    echo 'Running unit tests...'
                    sh 'npm test'
                }
            }
        }

        stage('Build application') {
            steps {
                script {
                    echo 'Building the application...'
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
