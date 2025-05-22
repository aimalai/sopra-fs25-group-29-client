# Flicks & Friends - Client Implementation Guide

<div align="center" style="width: 100%; border: 1px solid lightgrey; padding: 10px;">
  <img src="public/NiroLogo.png" alt="NiroLogo" style="max-width: 100%; height: auto;">
</div>

<br>

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![React](https://img.shields.io/badge/React-19-blue?logo=react) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Enabled-blue?logo=githubactions) ![H2 Database](https://img.shields.io/badge/H2%20Database-Enabled-blue?logo=h2) ![MIT License](https://img.shields.io/badge/license-MIT-green)

## Table of Contents

- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [High-Level Components](#high-level-components)
- [Launch & Deployment](#launch--deployment)
- [Illustrations](#illustrations)
- [Authors & Acknowledgment](#authors--acknowledgment)
- [License](#license)

## Introduction

Flicks & Friends 🎉 is your go-to platform for discovering, organizing, and enjoying movies and TV shows with friends. Whether you’re searching for new content, creating watch parties, or sharing recommendations, this app makes it easy to stay connected and entertained. Browse trending titles, manage watchlists, rate and review films, and experience synchronized watch parties—all in one place.

Driven by the increasing desire for community engagement and shared entertainment experiences, the app enables users to register, search titles via integrated APIs, rate and review what they watch, and organize virtual watch parties with friends, all from a single platform. Flicks & Friends aims to deliver a user-centric and collaborative experience.

Our primary motivation for choosing to work on this project is the lack of trustworthy recommendations that we see in the market – in contrast, the customers of Flicks & Friends will be able to rely upon the recommendations of their own friends rather than the recommendations of someone they don’t know about.

---

##### [Back to Top](#table-of-contents)

## Technologies Used

The frontend of this project is built using a modern and scalable technology stack, ensuring responsiveness, performance, and maintainability.

- **TypeScript 5**: Provides a strongly typed🔥, structured language that enhances code reliability and developer productivity in the frontend.
- **React 19**: A powerful component-based UI framework, enabling efficient rendering and state management for dynamic interfaces.
- **Vercel**: Handles frontend hosting and deployment, ensuring high availability, fast performance, and automated scaling.
- **GitHub Actions**: Implements continuous integration and deployment (CI/CD) workflows, automating testing and releases to streamline frontend development.
- **H2 Database**: Used for lightweight data storage and testing, supporting efficient frontend-backend interactions.

This technology stack enables a responsive, scalable, and efficient frontend, ensuring seamless user experience and maintainability.

---

##### [Back to Top](#table-of-contents)

## High-Level Components

Our application is structured into five main high-level components, each representing a core part of the user experience and application logic. Below we describe their purpose, interactions, and provide links to the relevant files:

#### 1. Dashboard Page
Role: Serves as the landing page and entry point for searching movies and TV shows. Users can input a query and are redirected to the results page.

Responsibilities:

- Capture search input

- Trigger navigation based on user query

- Display tutorial/help content

- Related components: TutorialContent, useAuth

#### 2. Results Page
Role: Displays the results of a search query. Users can view details, add or remove items from their watchlist, and sort/filter results.

Responsibilities:

- Fetch and render search results

- Watchlist integration (add/remove)

- Navigation to detail pages

- Related hooks: useApi, useSessionStorage, useAuth

#### 3. Watchlist Page
Role: Shows the authenticated user’s watchlist, their friends' public watchlists, and a list of top-rated movies recommended by friends.

Responsibilities:

- Load and display personal watchlist

- Fetch and filter friends’ shared watchlists

- Display social recommendations

- Related APIs: /users/{id}/watchlist, /users/{id}/friends/watchlists

#### 4. Watchparty System
- Create & Manage

- Details View

- Lobby (Synchronized Viewing)

Role: Enables users to create and participate in synchronized watch sessions with chat and readiness coordination.

Responsibilities:

- Schedule and invite friends to watchparties

- Live chat and readiness synchronization

- Embedded YouTube player with sync control (via WebSocket)

- Related tools: WebSocket (@stomp/stompjs), SockJS, YouTube Iframe API

#### 5. User Management
- User Search & Friend List

- Profile Page

Role: Handles user discovery, friend requests, and profile management.

Responsibilities:

- Search users and manage friendships

- View and edit user profile

- Control watchlist visibility and privacy

- Related components: avatars, ChatBox, useApi, useSessionStorage

##### [Back to Top](#table-of-contents)

## Launch & Deployment

### Commands to Build and Run Locally

#### Clone the repository:

```sh
git clone https://github.com/aimalai/sopra-fs25-group-29-client.git
```

#### Navigate to the clientt directory:

```sh
cd sopra-fs25-group-29-client
```

#### Install frontend dependencies:

```sh
npm install
```

#### Build the frontend:

```sh
npm run build
```

#### Run the frontend application:

```sh
npm run dev
```

The frontend application✨ should now be running, usually at [http://localhost:3000](http://localhost:3000).

### Frontend Dependencies

The frontend application uses the following main dependencies:

```
"dependencies": {
    "@ant-design/nextjs-registry": "^1.0.2",
    "@ant-design/v5-patch-for-react-19": "^1.0.3",
    "@stomp/stompjs": "^6.1.0",
    "axios": "^1.4.0",
    "dayjs": "^1.11.13",
    "moment": "^2.30.1",
    "next": "^15.2.0",
    "node-localstorage": "^3.0.5",
    "process": "^0.11.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "socket.io-client": "^4.7.2",
    "sockjs-client": "^1.5.2",
    "sopra-fs25-template-client": "file:"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.0",
    "@types/moment": "^2.11.29",
    "@types/node": "^22.13.5",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "eslint": "^9.21.0",
    "eslint-config-next": "^15.2.0",
    "typescript": "^5"
  }
```
---

##### [Back to Top](#table-of-contents)

## Illustrations

The following is the high-level user flow of our interface:

#### Dashboard Page

![Landing Page](public/Dashboard.png)

The dashboard is the main entry point of the application. Users are welcomed with a prominent search bar that allows them to look for movies and TV shows by entering a query. Upon submitting a search, they are redirected to the results page. Below the search input, a short tutorial component provides helpful usage guidance. This page is designed to be minimalistic and accessible, offering a clear call to action for users to begin their experience.

#### Results Page

![Registration Page](public/Results.png)

After submitting a search query on the dashboard, users are redirected to the results page. This view presents a list of matching movies or TV shows, complete with posters, release dates, and short descriptions. Users can sort results by popularity, rating, or date, and filter for complete entries only. Each item offers direct actions: adding or removing it from the personal watchlist and accessing a detailed view. The interface also supports responsive pagination and quick search refinement.

#### Detailed View with Reviews

![Login Page](public/DetailedViewWithReviews.png)

The detailed view presents comprehensive information about a selected movie or TV show, including title, release date, genre, cast, and description. Users can view the official TMDB rating, submit their own star rating, and optionally add a written review (max. 200 characters). The page also aggregates community ratings and displays a live-updated “review chat” featuring other users’ comments. A dynamic button allows users to add or remove the item from their personal watchlist directly. This page bridges rich content presentation with interactive user feedback features.

#### Users and Friends

![2FA Page](public/UsersAndFriendRequests.png)

This page allows users to discover other users, manage their friend list, and respond to incoming friend requests. The left section includes a search interface where users can look for others by username or email, with results displayed in a paginated table. The right section shows the current user's friends, and a third panel at the bottom lists pending friend requests with options to accept, decline, or view the sender’s profile. This feature fosters the social layer of the application and enables collaborative features like watchlist sharing and watchparty invitations.

#### Profile Page of a potential Friend

![Homepage](public/FriendsProfile.png)

This page shows a detailed profile view of another user. It displays public information such as username, email, biography, birthdate, and online status. Depending on the friendship status, users can either send or cancel a friend request, or, if already friends, remove the user and access a private chat through the integrated chatbox. The layout adapts dynamically based on whether the profile belongs to the current user or someone else. This view enhances transparency and supports social interaction by allowing contextual decisions about connecting with others.

#### Trending Page

![Trending Page](public/Trending.png)

The trending page displays a curated list of currently popular movies and TV shows. Data is fetched from the backend and rendered in a scrollable, card-based layout. Each entry includes a poster, title, and short overview. Clicking on a card navigates the user to the detailed view of the selected item. This feature offers inspiration and highlights content that’s currently popular, helping users quickly discover relevant entertainment.

#### Watchlist Page

![Watchlist Page](public/Watchlist.png)

The watchlist page gives users an organized overview of their saved movies and shows. It displays essential information such as title, poster, and date added, with quick access to each item's details. In addition, users can view watchlists of their friends, either individually or collectively, if they have chosen to share them. The page also features a personalized recommendation section showing top-rated content from friends (4 stars or higher), encouraging social discovery. The layout dynamically adapts to show helpful messages if a friend’s watchlist is private.

#### WatchpartyManager

![Watchlist Page](public/WatchpartyManager.png)

The watchparty manager allows users to create, schedule, and manage collaborative viewing sessions. Users can specify a title, time, and video link (e.g., YouTube), then invite friends to join. All upcoming parties are listed in a table with quick actions like viewing details or sending invitations. An additional panel shows live responses from invited participants. The system includes validation for scheduling and link input, ensuring a smooth and robust setup process. This page lays the foundation for real-time social viewing features.

#### DetailedWatchparty

![Watchlist Page](public/DetailedWatchparty.png)

This page provides an overview of a specific watchparty. It displays the organizer's name, the scheduled time (automatically converted to the user's local time zone), an optional description, and the link to the shared content (e.g., a YouTube video). Users can directly proceed to the synchronized watchparty lobby from here. This detailed view helps participants quickly understand what the session is about and prepares them to join at the right time.

#### Lobby

![Watchlist Page](public/Lobby.png)

The watchparty lobby enables real-time synchronized video viewing and chat among invited participants. Users can mark themselves as “ready”, triggering a countdown once everyone is prepared. The video player (YouTube-based) is synced using WebSockets, and any desynchronization is corrected with a timestamp broadcast from the host. A chat panel facilitates live conversation, while status indicators show each participant’s readiness. The system also handles edge cases such as video load errors and provides fallbacks. This page embodies the collaborative core of the platform.

---

##### [Back to Top](#table-of-contents)

## Roadmap

New frontend contributors can enhance the user experience by implementing the following high-impact features:

### 1. Interactive Watchparty Games / Activities 🎮
Description: Add interactive elements such as movie-themed trivia or real-time mini games to the watchparty lobby. These features would make the synchronized viewing experience more social and entertaining.
Frontend Focus:

- UI components for game flow and scoring

- Real-time interactions using WebSocket events

- Visual feedback for players

Complexity: High – Combines real-time communication, interactive UI design, and responsive feedback.
Value: High – Increases engagement and differentiates the platform with a playful twist.

### 2. Personalized Movie Recommendations Based on Social Graph 🔗
Description: Replace generic recommendations with suggestions based on friends' watchlists, ratings, and shared interests.
Frontend Focus:

- Display algorithms' output in the watchlist or trending section

- Interactive components for “Why was this recommended?”

- Clear visual cues linking content to friends' preferences

Complexity: Medium to High – Depends on backend API readiness, frontend must handle and interpret complex recommendation data.
Value: High – Makes discovery more relevant and social.

### 3. User-Generated Content (Clips & Reactions) 🎥
Description: Let users capture short clips or submit text/video reactions during or after watchparties.
Frontend Focus:

- UI for selecting/capturing clip moments

- Comment/reaction timeline overlay

- Upload and playback integration with YouTube or in-app player

Complexity: High – Involves video integration, UI overlays, and user feedback loops.
Value: Very High – Encourages creativity and strengthens community features.

## Authors & Acknowledgment

### Authors

The following people were the contributors to this project:

- **Admir Bjelic** - [GitHub: Admir17](https://github.com/Admir17)
- **Nirojan Ravichandran** - [GitHub: Zec01](https://github.com/Zec01)
- **Malaiappan Srinivasan** - [GitHub: aimalai](https://github.com/aimalai)
- **Mohamed Nacer Chabbi** - [GitHub: recan21](https://github.com/recan21)

### Acknowledgment

The authors would like to express their sincere thanks🍿 to **Diyar Taskiran** for his expert guidance throughout the course of this project. His invaluable insights and mentorship were instrumental in shaping our work.

---

##### [Back to Top](#table-of-contents)

## License

This project is licensed under the MIT License. Please check the [LICENSE](LICENSE) file for more details.
