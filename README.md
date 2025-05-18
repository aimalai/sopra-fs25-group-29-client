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

The Watchparty component of our frontend enables users to create and manage watch parties 🍿, invite friends, and track invitation responses. The central class for this functionality is <a href="app/watchparty/page.tsx" style="color: blue; text-decoration: underline;">WatchpartyPage</a>.

#### Key Features:

- Handles the creation of new watch parties, displays existing ones, and allows users to invite friends.

#### State Management:

- `watchparties`: Stores the list of fetched watch parties.
- `username`, `userIdStr`: Retrieved from session storage to identify the current user.
- `form`: Manages the form state for creating new watch parties.
- `inviteModalVisible`: Controls the visibility of the invite friends modal.
- `selectedWatchPartyId`: Stores the ID of the watch party selected for inviting friends.

#### Functions:

- `onFinish`: Handles the submission of the "Create Watchparty" form. It validates the input, converts the time to UTC, and sends a request to the backend API to create the watch party.
- `disabledDate`, `disabledTime`: Functions to disable past dates and times in the form's date and time pickers, ensuring that watch parties are scheduled for the future.
- `handleInviteClick`, `closeInviteModal`: Functions to show and close the InviteFriendsModal.
- `fetchData`: Fetches watch parties organized by the user and watch parties the user is invited to.

### InviteFriendsModal Component

This component is responsible for inviting friends to a selected watch party. It is opened when the user clicks the "Invite Friends" button for a specific watch party.

- Imported as `InviteFriendsModal`
- Takes `watchPartyId`, `visible`, and `onClose` as props.
- Displays a list of friends and sends invitations to the backend.

### InviteResponsesPolling Component

This component is responsible for polling for responses to invitations for watch parties created by the current user.

- Imported as `InviteResponsesPolling`
- Takes `watchParties` as a prop.
- Fetches the responses from invited users and displays them.

### UI Elements

This component uses a combination of state management, API calls, and UI elements to provide a functional interface for managing watch parties.

- **Ant Design components used**:
  - `Form`
  - `Input`
  - `Button`
  - `Card`
  - `Table`
  - `DatePicker`
  - `TimePicker`

---

##### [Back to Top](#table-of-contents)

## Launch & Deployment

### Commands to Build and Run Locally

#### Clone the repository:

```sh
git clone https://github.com/aimalai/sopra-fs25-group-29-client.git
cd sopra-fs25-group-29-client
```

#### Navigate to the frontend directory:

```sh
cd frontend
```

#### Install frontend dependencies:

```sh
npm install
```

#### Run the frontend application:

```sh
npm run dev
```

The frontend application✨ should now be running, usually at [http://localhost:3000](http://localhost:3000).

### Frontend Dependencies

The frontend application uses the following main dependencies:

- `@ant-design/nextjs-registry`: Integrates **Ant Design** components with **Next.js**.
- `@ant-design/v5-patch-for-react-19`: Patch for **React 19** and **Ant Design v5** compatibility.
- `@stomp/stompjs`: Enables **WebSocket communication** using STOMP.
- `dayjs`: Provides **date and time manipulation** features.
- `moment`: Another **date and time manipulation** library.
- `next`: The **Next.js framework** for building React applications.
- `node-localstorage`: Provides a **localStorage implementation** for Node.js.
- `react`: The core **React library** for UI development.
- `react-dom`: Provides **DOM-specific methods** for React.
- `socket.io-client`: Supports **real-time communication** using Socket.IO.
- `sockjs-client`: Acts as a **WebSocket fallback library**.

---

##### [Back to Top](#table-of-contents)

## Illustrations

The following is the high-level user flow of our interface:

#### Landing Page

![Landing Page](public/1.%20landing%20page.png)

#### Registration Page

![Registration Page](public/2.%20registration%20page.png)

#### Login Page

![Login Page](public/3.%20Login%20Page.png)

#### 2FA Page

![2FA Page](public/4.%202FA%20Page.png)

#### Homepage

![Homepage](public/5.%20Homepage.png)

#### Trending Page

![Trending Page](public/6.%20Trending%20Page.png)

#### Watchparty Page

![Watchparty Page](public/7.%20Watchparty%20Page.png)

#### Watchlist Page

![Watchlist Page](public/8.%20Watchlist%20Page.png)

---

##### [Back to Top](#table-of-contents)

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
