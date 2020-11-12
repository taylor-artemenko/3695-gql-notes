# 3695-gql-notes

Teamname: A Named Team

For security purposes we have hidden one of the directories in the root directory called ```conf```

Please create this direcotry after pulling the repo and include the following files with the following structure

1. cloudConf.js
    * ```
      module.exports = {
           cloud_name: 'YOUR_CLOUD_NAME_FROM_CLOUDINARY',
           api_key: 'YOUR_API_KEY_FROM_CLOUDINARY',
           api_secret: 'YOUR_API_SECRET_FROM_CLOUDINARY'
         }
      ```
NOTE: The cloudConf.js file is technically unecessary for this branch as its not required for the scope of this assignment. 

2. mongooseConn.js
    * ```
      module.exports = {
        conn: 'YOUR_MONGODB_CONN_STRING'
      }
      ```
Once those files are created, run ```npm install``` then ```npm start```

NOTE: Screenshots of this application running can be found in the screenshots.pdf file
