import React from "react";

const TutorialContent = () => {
  return (
    <div style={{ width: "100%", padding: "16px" }}>
      {/* Project Description */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h2 style={{ marginBottom: "36px" }}>
          🍿 Welcome to Flicks & Friends! ✨
        </h2>
        <p>
          Flicks & Friends is your go-to platform for discovering, organizing,
          and enjoying movies and TV shows with friends. Whether you’re
          searching for new content, creating watch parties, or sharing
          recommendations, this app makes it easy to stay connected and
          entertained. Browse trending titles, manage watchlists, rate and
          review films, and experience synchronized watch parties—all in one
          place.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {/* Section 1: Home */}
        <div
          style={{ flex: "1 1 45%", minWidth: "300px", marginBottom: "32px" }}
        >
          <h3 style={{ marginBottom: "16px" }}>Home 🏠</h3>
          <p style={{ marginBottom: "24px" }}>
            The Home section serves as the starting point for Flicks & Friends.
            Here, you can search for movies and TV shows using an integrated API
            and discover trending entertainment. Your personalized dashboard
            highlights recent activity, friend recommendations, and watchlist
            updates. The intuitive search bar helps you find content
            effortlessly, while previews display details like title, rating, and
            descriptions to help decide what to watch next.
          </p>
        </div>

        {/* Section 2: Create Watchparty */}
        <div
          style={{ flex: "1 1 45%", minWidth: "300px", marginBottom: "32px" }}
        >
          <h3 style={{ marginBottom: "16px" }}>Create Watchparty 🎉</h3>
          <p style={{ marginBottom: "24px" }}>
            This section lets you organize virtual watch parties with friends.
            Set a title, date, time, and movie link, then send out invites. As
            participants confirm their attendance, the party list updates in
            real-time. Once everyone is ready, a synchronized countdown ensures
            all viewers start watching at the same time. Engage with live chat,
            rate the content post-watch, and ensure no one misses a moment with
            the ‘Sync to Video’ button.
          </p>
        </div>

        {/* Section 3: Trending Now */}
        <div
          style={{ flex: "1 1 45%", minWidth: "300px", marginBottom: "32px" }}
        >
          <h3 style={{ marginBottom: "16px" }}>Trending Now 🔥</h3>
          <p style={{ marginBottom: "24px" }}>
            Stay updated on what’s popular! This section showcases highly rated
            and trending movies & TV shows. The trending list is refreshed
            hourly based on real-time user engagement and API metrics. Discover
            new releases, top-rated content, and watchlist suggestions, with
            options to instantly add them to your personal watchlist or read
            reviews from fellow users before deciding to watch.
          </p>
        </div>

        {/* Section 4: Your Watchlist */}
        <div
          style={{ flex: "1 1 45%", minWidth: "300px", marginBottom: "32px" }}
        >
          <h3 style={{ marginBottom: "16px" }}>Your Watchlist 📺</h3>
          <p style={{ marginBottom: "24px" }}>
            The Watchlist section helps you keep track of movies and shows you
            plan to watch. Any content you add from search, trending, or
            recommendations is stored here. Your watchlist is editable, allowing
            you to remove content or sort by date added. Movies highly rated by
            friends will appear as suggestions. Privacy controls let you decide
            who can view your watchlist, making it easy to share recommendations
            without oversharing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorialContent;
