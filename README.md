# Standart Backend Structure
Active since 24/11/2024

### Never commit on main branch directly
Do not commit package-lock.json, node_modules, tmp folders

# Guidelines for coding 
Always make sure your NODE_ENV is set to development while coding

## Folder and File naming structure
1. All the folder names should start in small letters
2. All the folder name should follow camelCase
3. All the file names should follow camelCase
4. All the function names should be in camel case
5. All the controller and model files should be named as filename.controller.js and filename.model.js
6. All the variables must be in camelCase
7. All the temperory files should be stored in tmp folder within public directory. Once the processing on file is done, it should be deleted from the directory


## Database structure

1. All the database model schemas should start from small letters in the database and capital in the code. For example for an admin schema

```
export const Admin = mongoose.model("Admin", adminSchema); 
```
in atlas it should be visbile as **admin**

2. Common functions like password hashing, code generation etc should be defined as proper methods within the schema files itself

## Routing structure

1. Each dedicated user route should be created in a separate folder.
2. Common Routes should be created in common folder

For example if your system has 2 users admin and client the routes should go like 

```
  admin
    | - index.routes.js (containing all the route reference for admin)
    | - auth (folder containing auth routes)
        | - index.routes.js
        | - auth.routes.js
        ...

    | - device (folder containing all device routes)
        | - index.js
        | - device.routes.js
        ....

  user
  | - index.routes.js (containing all route reference for user)
  | - auth (folder containing auth routes)
    | - index.routes.js
    | - auth.routes.js
    .....

```
If the routes are elementary and dont need to be divided, you can skip individual folder creation, instead can directly go ahead with route files

3. Every route should contain the path for the action being taken. For example if you are creating a auth route for admin, the route should be /admin/auth, for user the same route should be /user/auth. 

4. For writing the routes the correct format should be like this

```  
router.route('/route/path').get/post/put/delete(authenticationFunction, authorizationFunction, validationFunction, controllerFunction)
```

5. The route path should follow kebab structure. For example if there is a route to fetch data, the route path should be 

``` router.route('/get-data') ``` and **not** ``` router.route('/getData')X Incorrect ```

6. All the path variables used in the routes should be properly named, for example if you have a route with path parameter of user id the route should be 

``` router.route('/data/:userId') ``` and **not** ``` router.route('/data/:id)X Incorrect```

7. For methods such as get/post/put do not get/create/update words in route path unless it is depicting something different

For example if you have a route to create user, the route path must be
``` router.route('/user').post(userData)``` and **not** ``` router.route('/user/create).post(userData)X Incorrect```


## Validation Structure
1. All the query parameters, path parameters and body should be validated in the route using **express validators**

2. Validations like already exist/not found that require database call should happen only in the controllers. 

3. For example to check if the email is in correct format, it should be done by validators, but to check if the user with this email already exist, the call should happen in controller


## Controller Structure

1. For each completely independent user the controller should be in a separate folder
2. For role based segment, the controller folder can be same for different role based user
3. Common controllers that are being used by multiple users can be moved to a separate common folder

A sample folder structure is mentioned below

``` 
  admin
    | - auth (folder containing auth controllers)
        | - register.controller.js
        | - login.controller.js
        ...

  user
  | -  auth (folder containing auth controllers)
        | - register.controller.js
        | - login.controller.js
    ...

```

4. Where ever you are updating 2 or more collection together, make sure to add mongoDB transaction session on the complete query

5. Make sure you send proper status code in the return statement. There are separate classses defined to send apiError and apiResponse in a desired format, use that only while sending data back

6. Make sure you throw proper error messages and status codes whereever necessary

### Standard Status codes 

200 - Request success (get/put/delete success)

201 - Data created at server (generally used with post request)

400 - Bad Request (parameters/body not proper format)

401 - Unauthorized (JWT missing)

403 - Forbidden (permission based, if somebody tries to access a resource withour relevant permission)

404 - Resource not found

409 - Conflict (data already exist in server)

500 - Internal Server error

## Utils and helper folders

Utils should contain all the utility based functions including declaring storage, configurations etc

Helper should be used for all the common functions like emailSender, smsSender etc


## CORS SETUP

Within the structure you will notice contansts folder, it includes the cors declaration, add your frontend url in the development array for cors management

## ENV structure

1. All the Env variable names should be in capital letters

2. Any variable that is being used in more than 1 file should be included in ENV variable file and should not be hardcoded

3. Make sure you are always working on Dev env file unless explicitly asked to change env file


**A sample Controller and route has been created for your reference.**

*Remember when in doubt ask it out! Do not commit any code that does not match the guideline*
