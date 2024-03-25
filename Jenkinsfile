namespace = 'production'
serviceName = 'micro-auth'
service = 'Freelance Auth'

def groovyMethods

m1=System.currentTimeMillis()  //Exectuting Time of the Pipeline

pipeline{
    agent{
        label 'Jenkins_agent'
    }

    tools{
        nodejs "NodeJS"
        dockerTool "Docker"
    }

    environment{
        DOCKER_CREDENTIALS = credentials('dockerhub')
        IMAGE_NAME = 'ashishnewar' + '/' + 'freelance-auth'
        IMAGE_TAG = "stable-${BUILD_NUMBER}"
    }

    stages{
        stage('CleanUp Workspace'){
            steps{
                cleanWs()
            }
        }
        
        stage('Prepare Environment'){
            steps{
                sh "[ -d pipeline ] || mkdir pipeline"
                dir('pipeline'){
                    git branch: 'main', credentialsId: 'github',url: 'https://github.com/AshNewar/Jenkins-Automation'
                    script{
                        groovyMethods = load 'functions.groovy'
                    }
                }
                git branch: 'main', credentialsId: 'github', url: 'https://github.com/AshNewar/freelance-auth'
                sh 'npm install'
            }
        }

        stage('Lint Check'){
            steps{
                sh 'npm run lint:check'
            }
        }

        stage('Code Format Check'){
            steps{
                sh 'npm run prettier:check'
            }
        }

        stage('Unit Test'){
            steps{
                sh 'npm run test'
            } 
        }

        stage('Build And Push Docker Image'){
            steps{
                sh "docker login -u $DOCKER_CREDENTIALS_USR --password $DOCKER_CREDENTIALS_PSW"
                sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
                sh "docker tag $IMAGE_NAME $IMAGE_NAME:$IMAGE_TAG"
                sh "docker tag $IMAGE_NAME $IMAGE_NAME:stable"
                sh "docker push $IMAGE_NAME:$IMAGE_TAG"
                sh "docker push $IMAGE_NAME:stable"
            }
        }

        stage('CleanUp The Images'){
            steps{
                sh "docker rmi $IMAGE_NAME:$IMAGE_TAG"
                sh "docker rmi $IMAGE_NAME:stable"
            }
        }

        stage('Create New Pod'){
            steps{
                withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: 'minikube', credentialsId: 'jenkins-k8s-token', namespace: '', serverUrl: 'https://192.168.59.102:8443']]) {
                    script{
                        def pods = groovyMethods.findPodsFromName("${namespace}", "${serviceName}")
                        for(podName in pods){
                            sh """
                                kubectl delete pod ${podName} -n ${namespace}
                                sleep 10s
                            """
                        }
                    }
                }
            }
        }
    }

    post{
        success{
            script{
                m2 = System.currentTimeMillis()
                def duration = groovyMethods.durationTime(m1, m2)
                def author = groovyMethods.readCommitAuthor()
                def attachments =[
        				[
        					title: "BUILD SUCCEEDED: ${service} Service with build number ${env.BUILD_NUMBER}",
        					title_link: "${env.BUILD_URL}",
        					color: "good",
        					text: "Created by: ${author}",
        					"mrkdwn_in": ["fields"],
        					fields: [
        						[
        							title: "Duration Time",
        							value: "${duration}",
        							short: true
        						],
        						[
        							title: "Stage Name",
        							value: "Production",
        							short: true
        						],
        					]
        				]
        		]
                groovyMethods.notifySlack("The pipeline for ${service} has been completed successfully", 'freelance-jenkins', attachments)
            }
        }

        failure{
            script{
                m2 = System.currentTimeMillis()
                def duration = groovyMethods.durationTime(m1, m2)
                def author = groovyMethods.readCommitAuthor()
                def attachments =[
        				[
        					title: "BUILD FAILED: ${service} Service with build number ${env.BUILD_NUMBER}",
        					title_link: "${env.BUILD_URL}",
        					color: "error",
        					text: "Created by: ${author}",
        					"mrkdwn_in": ["fields"],
        					fields: [
        						[
        							title: "Duration Time",
        							value: "${duration}",
        							short: true
        						],
        						[
        							title: "Stage Name",
        							value: "Production",
        							short: true
        						],
        					]
        				]
        		]
                groovyMethods.notifySlack("The pipeline for ${service} has been failed", 'freelance-jenkins', attachments)
            }
        }
    }
}