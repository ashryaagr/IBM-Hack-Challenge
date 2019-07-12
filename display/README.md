# Display

This folder contains the server side and client side code for the display . 
The data recieved from the ML model is processed here .

----

## Directory Structure 
```
.
├── config
│   └── dev.env
├── package.json
├── README.md
├── public
│   ├── css
│   ├── img
│   └── js
└── src
    ├── db
    ├── index.js
    ├── middleware
    ├── models
    └── routers
```

---

## Routes

The various routes defined in this node server are :

- { Request method } /{route} : function
- POST /login/ : login
- GET /logout/ : logout
- POST /user/ : register user
- PATCH /user/ : update user profile
- DELETE /user/ : delete user
- POST /friend/ : add friend for the logged in user
- PATCH /friend/ : update friend
- DELETE /friend/:id/ : delete friend with the ObjectID as id
- POST /personality : get a information on personality traits
- POST /nlu : get information on interests
- POST /tone : get information about tone and emotions
- GET /cluster : perform clustering analysis on friends

---