import React from "react";
import { Row, Col, Card } from "antd";
const { Meta } = Card;

const TutorialContent = () => {
  return (
    <div style={{ width: "100%", padding: "16px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h2 style={{ color: "#001529", marginBottom: "36px" }}>🍿 Welcome to Flicks & Friends! ✨</h2>
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

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={12}>
          <Card hoverable className="tutorial-card">
            <h3>Home 🏠</h3>
            <p>
              The Home section serves as the starting point for Flicks & Friends.
              Here, you can search for movies and TV shows using an integrated API
              and discover trending entertainment. Your personalized dashboard
              highlights recent activity, friend recommendations, and watchlist
              updates. The intuitive search bar helps you find content
              effortlessly, while previews display details like title, rating, and
              descriptions to help decide what to watch next.
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={12}>
          <Card hoverable className="tutorial-card">
            <h3>Create Watchparty 🎉</h3>
            <p>
              This section lets you organize virtual watch parties with friends.
              Set a title, date, time, and movie link, then send out invites. As
              participants confirm their attendance, the party list updates in
              real-time. Once everyone is ready, a synchronized countdown ensures
              all viewers start watching at the same time. Engage with live chat,
              rate the content post-watch, and ensure no one misses a moment with
              the ‘Sync to Video’ button.
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={12}>
          <Card hoverable className="tutorial-card">
            <h3>Trending Now 🔥</h3>
            <p>
              Stay updated on what’s popular! This section showcases highly rated
              and trending movies & TV shows. The trending list is refreshed
              hourly based on user engagement and API metrics. Along with global
              trends, discover movies trending among your friends, ensuring
              recommendations match your preferences. Instantly add titles to your
              watchlist or read reviews from fellow users before deciding to
              watch.
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={12}>
          <Card hoverable className="tutorial-card">
            <h3>Your Watchlist 📺</h3>
            <p>
              The Watchlist section helps you keep track of movies and shows you
              plan to watch. Any content you add from search, trending, or
              recommendations is stored here. Your watchlist is editable, allowing
              you to remove content or sort by date added. Movies highly rated by
              friends will appear as suggestions. Privacy controls let you decide
              who can view your watchlist, making it easy to share recommendations
              without oversharing.
            </p>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .tutorial-card {
          border-radius: 16px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .tutorial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        h2 {
          color: #001529;
        }
        h3 {
          color: #001529;
        }
        p {
          color: rgba(0, 0, 0, 0.65);
        }
      `}</style>
    </div>
  );
};

export default TutorialContent;
