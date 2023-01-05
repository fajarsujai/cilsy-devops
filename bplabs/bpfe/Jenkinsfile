pipeline {
    agent any
    environment {
        registry = "docker.io/fajarsujai/bpfe"
        serviceName = "frontend-bp"
        dockerImage = ''
        branchname = "staging"
    }
    stages {
        stage("Clone Code") {
            steps {
                script {
                    checkout scm: [$class: 'GitSCM', userRemoteConfigs: [[url: 'https://github.com/fajarsujai/Bpfe.git',
                    credentialsId: 'credential_fajarsujai_git']], branches: [[name: "${branchname}" ]]],poll: true
                    env.HASH = sh(script: "echo \$(git rev-parse --short HEAD)",returnStdout: true).trim()
                    env.VERSION = "${env.BUILD_NUMBER}-${branchname}-${env.HASH}"
                }
            }
        }
        stage("Build Image") {
            steps {
                script {
                    sh "docker build -t $registry:$env.VERSION ."
                }
            }
        }
        stage('Login') {
            environment {
                DOCKER_USERNAME = credentials("dockerhub-fajarsujai-username")
                DOCKER_PASSWORD = credentials("dockerhub-fajarsujai-password")
            }
            steps{ 
                script {
                    sh "docker login --username ${DOCKER_USERNAME} --password ${DOCKER_PASSWORD}"
                    }
                }
            }
        stage('Push Image') {
            steps{ 
                script {
                    sh "docker push $registry:$env.VERSION"
                    }
                }
            }
        stage('Remove Unused Docker Image') {
            steps{
                script {
                    sh "docker rmi $registry:$env.VERSION"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps{
                script {
                        sh "sed -i 's/bpfe:latest/bpfe:$env.VERSION/g' deployment-fe.yaml"
                        sh "kubectl apply -f deployment-fe.yaml"
                        sh "kubectl rollout status deployment -n staging frontend-bp"
                        sh "kubectl get pods -n staging | grep frontend-bp"
                }
            }
        }
    }
}
