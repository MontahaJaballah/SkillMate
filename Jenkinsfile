pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from GitHub repository
                git branch: 'main', url: 'https://github.com/MontahaJaballah/SkillMate.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                // Install dependencies, for example, using npm
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Run your tests (example with npm)
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                // Deploy your application (you can adjust this according to your project)
                echo 'Deploying application...'
            }
        }
    }

    post {
        always {
            // Clean up after the build
            echo 'Cleaning up...'
        }
    }
}
