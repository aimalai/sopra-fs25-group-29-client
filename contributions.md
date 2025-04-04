# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - [24.03.2025] to [30.03.2025]

| **Student**    | **Date** | **Link to Commit**                                                                                                                                                                                              | **Description**                                                                                                                                                                                                                          | **Relevance**                                                                                                                                                                                    |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @aimalai       | PLEASE   | SEE                                                                                                                                                                                                             | SEPARATE TABLE                                                                                                                                                                                                                           | BELOW                                                                                                                                                                                            |
| **[@Recan21]** | [30.03]  | [https://github.com/aimalai/sopra-fs25-group-29-client/commit/7a9e12c134a550f6135d2329766634b7bdb15f88]                                                                                                         | [For our future feature that allows users to search for movies, we needed to implement a search bar in the frontend. This part is designed to accept user input and, upon clicking the magnifying glass icon, process the search query.] | [This contribution is relevant because it lays the foundation for a seamless movie search experience.]                                                                                           |
|                | [30.03]  | [https://github.com/aimalai/sopra-fs25-group-29-server/commit/bab9b01644ef5b61f0a4e04dc84f68f8b5fdaaa2, https://github.com/aimalai/sopra-fs25-group-29-client/commit/81737d9501e317ab4de1bf4134e1f536272cd18f ] | [In these commits, we implemented a new Details Page. This page allows users to click on individual movie titles to access a detailed view of the selected film, providing additional information.]                                      | [This contribution is important because it provides users with a dedicated page for detailed information about each film. By offering an in-depth view when clicking on a movie title.]          |
|                | [28.03]  | [beside commits]                                                                                                                                                                                                | [Icreated the API key using the TMDB website.]                                                                                                                                                                                           | [This is important because by securing an API key, our application can access up-to-date movie data directly from TMDB.]                                                                         |
| **[@Zec01]**   | [28.03]  | [https://github.com/aimalai/sopra-fs25-group-29-server/commit/c3bd0339b0fbd1a05f954e86de86b60db5a810b4, https://github.com/aimalai/sopra-fs25-group-29-server/commit/770bd3b796fb717426cd3297013b3add89963c3f]  | [I have integrated functionality into our backend (using MovieService.java and MovieController.java) that allows the use of the API key, so that we can already work with TMDB.]                                                         | [This contribution is relevant because our entire web app relies on the TMDB API to fetch detailed information for each movie. ]                                                                 |
|                | [30.03]  | [https://github.com/aimalai/sopra-fs25-group-29-client/commit/adc5c04bba81aefc93e97f59a020e893bd39ace4]                                                                                                         | [In the frontend, we introduced a new "Results" page. This page is seamlessly integrated with our newly implemented search bar functionality, ensuring that the search results are displayed on a dedicated page.]                       | [This contribution is relevant because it enables users to easily search for and find movies—a key functionality if we want to build features like a watchlist or start a watch party later on.] |
|                | [30.03]  | [https://github.com/aimalai/sopra-fs25-group-29-client/commit/41e963b7cd4ea5aafc0569df359068a4dedf5913]                                                                                                         | [In this commit, small changes were made to the frontend dashboard to show an empty Friends Overview.]                                                                                                                                   | [This contribution is important because it is the start for future development of interactive social features.]                                                                                  |
| **[@Admir17]** | [-]      | [Joker]                                                                                                                                                                                                         | []                                                                                                                                                                                                                                       | []                                                                                                                                                                                               |

| **Student** | **Date** | **Link to Commit**                                                                                    | **Description**                                                                                                                                                                                                                                                                        | **Relevance**                                                                 |
| ----------- | -------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| @aimalai    | [26.03]  |                                                                                                       | Conceptualized and planned the DB architecture, designing the different layers of the DB system and the SQL Schema.                                                                                                                                                                    | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [26.03]  |                                                                                                       | Set up the PostgreSQL database to efficiently store and manage data (acting as the locally set up persistence layer).                                                                                                                                                                  | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [27.03]  |                                                                                                       | Frontend and backend code in Visual Studio Code, relating to the DB set up.                                                                                                                                                                                                            | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [27.03]  |                                                                                                       | Setting up Vercel connection with the DB.                                                                                                                                                                                                                                              | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [28.03]  |                                                                                                       | Setting up Google Cloud backend connection with the DB.                                                                                                                                                                                                                                | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [28.03]  |                                                                                                       | Identifying the need for and understanding Ngrok. Configured Ngrok to expose the local backend securely, bridging the connection between platforms.                                                                                                                                    | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [29.03]  |                                                                                                       | Established the multi-platform connection: frontend (on Vercel), backend (on Google Cloud, via Ngrok), PostgreSQL database (on desktop).                                                                                                                                               | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [30.03]  |                                                                                                       | Then ultimately moved the locally tested persistence layer to the SQL Cloud, including the understanding the Google SQL Cloud and implementing its set up. Ensuring that Cloud DB architecture worked in tandem with Vercel Frontend and Google Cloud Backend (App Engine)             | Database Design and Set up Work, relevant to all project tasks relating to DB |
| @aimalai    | [28.03]  | https://github.com/aimalai/sopra-fs25-group-29-client/commit/edb1aa51dca3f3cacd7575c4e8164c9269a0e56d | The New User Registration Form: The new user must fill in a registration form with the following fields: username, password, confirm password. Mandatorily, all fields.                                                                                                                | Issues #1 #2 #3 of User Story 1 in the client side                            |
| @aimalai    | [28.03]  | https://github.com/aimalai/sopra-fs25-group-29-client/commit/edb1aa51dca3f3cacd7575c4e8164c9269a0e56d | Validation of Username: The project set up must check if the username is unique and is not already used by someone else. If the username is already taken, an error message should be shown.                                                                                           | Issues #1 #2 #3 of User Story 1 in the client side                            |
| @aimalai    | [28.03]  | https://github.com/aimalai/sopra-fs25-group-29-client/commit/edb1aa51dca3f3cacd7575c4e8164c9269a0e56d | Validation of Password: Passwords must be at least 8 char long and include a mix of letters, numbers, and special chars. The project set up should validate the password meets these criteria and that the "password" and "confirm password" fields match the acceptance requirements. | Issues #1 #2 #3 of User Story 1 in the client side                            |
| @aimalai    | [30.03]  | https://github.com/aimalai/sopra-fs25-group-29-server/commit/134dbc02a6ff17a541174857d5ce004ed68ab9b8 | New User Creation: Upon successful validation, a new user is created in the database with their registration information and creation date.                                                                                                                                            | Issues #60 #61 #62 # 63 of User Story 1 in the server side                    |
| @aimalai    | [30.03]  | https://github.com/aimalai/sopra-fs25-group-29-server/commit/134dbc02a6ff17a541174857d5ce004ed68ab9b8 | First Login After Registration: After successful registration, the user is automatically logged in for the first time and the user will be redirected to the users overview screen.                                                                                                    | Issues #60 #61 #62 # 63 of User Story 1 in the server side                    |
| @aimalai    | [30.03]  | https://github.com/aimalai/sopra-fs25-group-29-server/commit/134dbc02a6ff17a541174857d5ce004ed68ab9b8 | Handling Errors: If the registration fails (by not meeting the set criteria), an error message is displayed and the user should be redirected to the original registration screen.                                                                                                     | Issues #60 #61 #62 # 63 of User Story 1 in the server side                    |
| @aimalai    | [30.03]  | https://github.com/aimalai/sopra-fs25-group-29-server/commit/134dbc02a6ff17a541174857d5ce004ed68ab9b8 | Logout/Login Functionality: A registered user can logout from their account and log back in with their username and password once they meet these acceptance requirements.                                                                                                             | Issues #60 #61 #62 # 63 of User Story 1 in the server side.                   |

---

## Contributions Week 2 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
