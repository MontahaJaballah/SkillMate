pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/MontahaJaballah/SkillMate.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
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
                echo 'Running tests... (expand with your actual test commands)'
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up...'
            }
        }
    }
}