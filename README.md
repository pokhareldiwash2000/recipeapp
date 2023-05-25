"# recipeapp" 

endpoint: https://recipeapp-lh51.onrender.com
admin credentials=> email:admin@gmail.com password: adminadmin
user credentials=> email: oldgod@gmail.com  password: doubletrouble   OR you can just register with google at 
https://recipeapp-lh51.onrender.com/api/user/auth/google

//user creation & authentication

    POST /api/user/register   takes in  name, email , password 
    POST /api/user/login      takes in name and email     returns 'auth-token' to be added to the header on        subsequent request to maintain session 
    POST /api/user/logout       include auth-token in header
    GET /api/user/auth/google   to sign up with google as well as to login with google  returns 'auth-token'

//user account functionalities after logging in 

    GET /api/account    get the profile information of self 
    DELETE /api/account/:id     delete own account
    PUT /api/account/:id     change username and password  takes in either 'name' or 'password' 
    POST /api/account/profile-picture    upload or change profile pic, takes in file as form-data under key 'photo'

//admin functionalities
    POST '/api/admin/register' route to register a new admin user
    GET 'api/admin/finduser/:id' route to get user information by ID
    GET 'api/admin/findme' route to get own profile information
    GET 'api/admin/finduser' route to get user information by email query api/admin/finduser?email="example@fh.com"
    DELETE '/deleteuser/:id' route to delete a user by ID
    DELETE '/deletecomment/:id' route to delete a comment by ID
    DELETE '/deletepost/:id' route to delete a post by ID

//admin functionality for managing site's static resources like carousel photos and right side's videos display
    POST 'api/admin/upload/photo' - Route for uploading photos send photo as form data
    POST 'api/admin/upload/video' - Route for uploading videos send video as form data
    DELETE 'api/admin/remove/photo/:filename' - Route for deleting photos
    DELETE 'api/admin/remove/video/:filename' - Route for deleting videos
    GET '/photos' - Route for getting a list of uploaded photos
    GET '/videos' - Route for getting a list of uploaded videos

//dashboard posts related functionalities
    GET '/api/posts'
    Description: This endpoint is used to retrieve posts from the database based on optional query parameters.
    Query parameters:
    cuisine: Optional, filter posts based on cuisine category
    course: Optional, filter posts based on course category
    diet: Optional, filter posts based on diet category
    limit: Optional, limit the number of posts to be retrieved

    GET '/api/posts/:id' route to get a single post by ID

// A user's personal control over creation of posts

Very important: All the upload to the route below should be  made as form data not application/json

    GET '/api/myposts'
    Query Parameters: cuisine, course, diet, limit
    Description: Get all posts or filter posts by cuisine, course, or diet
    Response: JSON array of posts

    GET '/api/myposts/:id'
    Description: Get post by ID
    Response: Post object or 404 error if post is not found

    POST '/api/myposts'
    Request Body Parameters: name, description, photo, youtubeURL, servings, cookingTime, prepTime, ingredients, steps, cuisinecategory, coursecategory, dietcategory
    Description: Create a new post
    Response: Created post object or 500 error if failed to create post

    PATCH '/api/myposts/:id'
    Authentication: User must be verified
    Description: Updates a post with the specified ID.
    Request Body:Fields to update in the post
    Response:Updated post object

    DELETE /api/myposts/:id
    Authentication: User must be verified
    Description: Deletes a post with the specified ID.
    Response:Deleted post object

// commenting related functionalities

    CREATE NEW COMMENT
    POST '/api/comment'
    Authorization Required: Yes
    Request Body: { post: string, text: string, rating: number }

    EDIT COMMENT by comment id
    PATCH '/api/comment/:id'
    Authorization Required: Yes
    Request Body: { text: string, rating: number }

    DELETE COMMENT by comment id
    DELETE '/api/comment/:id'
    Authorization Required: Yes

//searching and filtering routes

GET request to /api/search?q=search-term
    Description: This endpoint searches for posts in the database that match the specified search term using fuzzy matching. 
    Query Parameters:
    q: The search term to match.
    Response:
    If successful, returns a JSON object containing the matched posts.
    If unsuccessful, returns a JSON object with a message property containing an error message.

GET request to /api/search/filter
    Description: This endpoint filters posts in the database based on specified cuisine, course, and diet categories. It returns a list of filtered posts.
    Query Parameters:
    cuisine: The cuisine categories to filter by, separated by commas.
    course: The course categories to filter by, separated by commas.
    diet: The diet categories to filter by, separated by commas.
    Response:
    If successful, returns a JSON object containing the filtered posts.
    If unsuccessful, returns a JSON object with a message property containing an error message.

FIltering functionalities

you can filter by going to api/filter/new, api/filter/most-viewed, api/filter/most-interacted, api/filter/popular, api/filter/trending

you can also send pagination and limit as query
by default page=1, limit=10


