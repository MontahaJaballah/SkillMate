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
                sh 'ls -la'  // Check if package.json exists
            }
        }

        stage('Install Dependencies') {
    steps {
        script {
            sh 'cd backend && npm install'
        }
    }
}

        stage('Run Tests') {
            steps {
                sh 'npm test' // Replace with your actual test command
            }
        }
    }
}
