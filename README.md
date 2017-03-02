# ABOUT THIS PROJECT


# TO USE THIS PROJECT


##### To Start The Server
```npm run start```

##### - User POST Requests
```http POST localhost:8000/api/signup username="User Name" password="passwordhere" email="email@address.com"```
This will return a password hash.

##### - User GET Requests
```http localhost:8000/api/signin -a "User Name":"password"```
This will return a password hash.

Note: in the post and get lines above please replace the port number with whatever port is noted when you start.
