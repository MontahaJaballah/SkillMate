pipeline {
    agent any
    environment {
        frontendDir = 'frontend'
        backendDir = 'backend'
    }

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
                    if (fileExists("${backendDir}/package.json")) {
                        echo 'backend/package.json found, installing dependencies...'
                        sh """
                            cd ${backendDir}
                            rm -rf node_modules package-lock.json
                            npm install
                        """
                    } else {
                        error 'backend/package.json is missing. Stopping pipeline.'
                    }
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                script {
                    if (fileExists("${frontendDir}/package.json")) {
                        echo 'frontend/package.json found, installing dependencies...'
                        sh """
                            cd ${frontendDir}
                            rm -rf node_modules package-lock.json
                            npm install --force
                            npm audit fix --force || true
                        """
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
                    sh "cd ${backendDir} && npm test"
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                script {
                    echo 'Running frontend tests...'
                    sh """
                        cd ${frontendDir}
                        npm test -- --watchAll=false --passWithNoTests
                    """
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo 'Building backend...'
                    sh "cd ${backendDir} && npm run build"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building frontend...'
                    sh "cd ${frontendDir} && npm run build"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully! '
        }
        failure {
            echo 'Pipeline failed. Check the logs for details. '
        }
        always {
            script {
                echo 'Cleaning up workspace...'
                cleanWs()
            }
        }
    }
}