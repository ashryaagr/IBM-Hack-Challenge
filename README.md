# FRIEND AFFINITY FINDER

## Demo
[![Watch the video](https://img.youtube.com/vi/xOQMxOZ5OcU/maxresdefault.jpg)](https://youtu.be/xOQMxOZ5OcU)

---
## Setup Instructions
Follow these instructions to setup the project
- Install Docker and Docker-Compose
- Open the terminal and navigate to the project's root directory.
- Use your API keys. For details see the next section on API keys.
- Execute the following command :
```docker-compose build```
- The previous command builds the project on the system.
- To run the project execute the following command :
```docker-compose up```
- Now go to your browser and open <localhost:3000>
- Now the system is ready. The user can use the web app. 
- If you want to shutdown the server press CTRL+C .
- If you want to clean the build execute the following command :
```docker-compose down```
---
## API Keys
- To prevent the misuse of API keys we generated, we have removed them.
- So, to use the project please use your API keys.
- You will have to generate API keys for Twitter, Reddit, StackExchange, Youtube.
- API keys for IBM Cloud should also be generated. You will have to generate API keys for the following services :
    - Personality Insights
    - Natural Language Understanding
    - Tone Analyzer
- The generated API keys will have to be put in the following files :
    - data_collector/reddit_credentials.py
    - data_collector/stackexchange_credentials.py
    - data_collector/twitter_credentials.py
    - data_collector/youtube_credentials.py
    - display/credentials.js
