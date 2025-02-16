pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://github.com/MontahaJaballah/SkillMate.git'
            }
        }

        stage('List Files (Debug)') {
            steps {
                sh 'ls -la'  // Vérifier si package.json et backend existent
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
    }  
}
