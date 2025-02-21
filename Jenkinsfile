pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                script {
                    cleanWs()
                    git branch: 'develop', url: 'https://github.com/MontahaJaballah/SkillMate.git'
                }
            }
        }

        stage('Install Backend Dependencies') { 
            steps {
                script {
                    if (fileExists('backend/package.json')) {
                        echo 'backend/package.json found, installing dependencies...'
                        sh '''
                            cd backend
                            rm -rf node_modules package-lock.json
                            npm install
                            npm audit fix --force
                        '''
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
                        sh '''
                            cd frontend
                            rm -rf node_modules package-lock.json
                            npm install
                            npm audit fix --force
                            npm install react-scripts --save-dev
                        '''
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
                    sh '''
                        cd frontend
                        npm list react-scripts || npm install react-scripts --save-dev
                        npm test --passWithNoTests
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    if (fileExists('backend')) {
                        echo 'Building backend...'
                        sh 'cd backend && npm run build'
                    } else {
                        error 'Backend directory is missing. Stopping pipeline.'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    if (fileExists('frontend')) {
                        echo 'Building frontend...'
                        sh 'cd frontend && npm run build'
                    } else {
                        error 'Frontend directory is missing. Stopping pipeline.'
                    }
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
