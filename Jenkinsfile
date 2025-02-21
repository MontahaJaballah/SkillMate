pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                script {
                    cleanWs() // Ensures a clean workspace before checkout
                    git branch: 'develop', url: 'https://github.com/MontahaJaballah/SkillMate.git'
                }
            }
        }

        stage('Install Backend Dependencies') { 
            steps {
                script {
                    if (fileExists('backend/package.json')) {
                        echo 'backend/package.json found, installing dependencies...'
                        sh 'cd backend && npm install'
                    } else {
                        error 'backend/package.json is missing. Stopping pipeline.'
                    }
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                script {
                    if (fileExists('frontend/package.json')) {
                        echo 'frontend/package.json found, installing dependencies...'
                        sh 'cd frontend && npm install'
                    } else {
                        error 'frontend/package.json is missing. Stopping pipeline.'
                    }
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                script {
                    echo 'Running backend tests...'
                    sh 'cd backend && npm test'
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                script {
                    echo 'Running frontend tests...'
                    sh 'cd frontend && npm test'
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo 'Building backend...'
                    sh 'cd backend && npm run build'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building frontend...'
                    sh 'cd frontend && npm run build'
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
