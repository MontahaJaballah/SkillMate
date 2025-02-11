pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from your repository
                git 'https://github.com/MontahaJaballah/SkillMate.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    // Check if package.json exists and then run npm install
                    if (fileExists('package.json')) {
                        echo 'package.json found, installing dependencies...'
                        sh 'npm install'
                    } else {
                        echo 'package.json not found!'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Placeholder for running tests
                    echo 'Running tests (this can be expanded later)...'
                    // Example: sh 'npm test'
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up workspace (if needed)...'
            }
        }
    }
}
