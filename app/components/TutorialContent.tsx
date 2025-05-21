import React, { useState } from 'react';
import { Steps, Table, Card, Rate, Button, Space, Grid, Input, message } from 'antd';

const { Step } = Steps;
const { useBreakpoint } = Grid;

const watchlistData = [
  { key: '1', poster: '/john.jpg', title: 'Sample Movie 1', addedOn: '2025-05-01' },
  { key: '2', poster: '/denzel.jpg', title: 'Sample Movie 2', addedOn: '2025-05-10' },
  { key: '3', poster: '/breaking.jpg', title: 'Sample TV Series 1', addedOn: '2025-05-15' },
];

const johnDetails = {
  poster: '/john.jpg',
  title: 'John Wick',
  releaseDate: '2014-10-22',
  genre: 'Action, Thriller',
  cast: 'Keanu Reeves, Michael Nyqvist, Alfie Allen, Willem Dafoe, Dean Winters',
  description: 'Ex-hitman John Wick comes out of retirement to track down the gangsters that took everything from him.',
  tmdbRating: 3.7,
  avgUserRating: 0.0,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#007BFF',
  borderColor: '#007BFF',
  color: '#fff',
};

export default function TutorialWizard() {
  const [current, setCurrent] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showReview, setShowReview] = useState(false);
  const screens = useBreakpoint();

  const next = () => setCurrent(prev => prev + 1);
  const prev = () => setCurrent(prev => prev - 1);

  const handleReviewSubmit = () => {
    message.success('Review submitted!');
  };

  const steps = [
    {
      title: 'Starting Point',
      content: (
        <Card hoverable style={{ width: '100%', marginBottom: 24 }}>
          <h2>Welcome to Flicks & Friends 🍿✨</h2>
          <p>Your ultimate hub to discover, rate, and share movies & TV shows together.</p>
          <p>Get started by searching for a movie above, or explore what you can do here.</p>
        </Card>
      ),
    },
    {
      title: 'Your Watchlist',
      content: (
        <>
          <Card hoverable style={{ width: '100%', marginBottom: 24 }}>
            <h2>Keep track of your movies and shows you’ve added 🕵️‍♂️</h2>
            <p>You can also see the Watchlists of your Friends</p>
          </Card>
          <Table
            columns={[
              {
                title: 'Poster', dataIndex: 'poster', key: 'poster', width: 100,
                render: src => <img src={src} alt="Poster" style={{ width: 60, height: 90, borderRadius: 4 }} />
              },
              { title: 'Title', dataIndex: 'title', key: 'title' },
              { title: 'Added On', dataIndex: 'addedOn', key: 'addedOn' },
              { title: 'Actions', key: 'actions', render: () => <Button style={buttonStyle} onClick={() => setCurrent(2)}>Details</Button> }
            ]}
            dataSource={watchlistData}
            pagination={false}
            style={{ width: '100%' }}
          />
        </>
      ),
    },
    {
      title: 'Movie Details',
      content: (
        <>
          <Card hoverable style={{ width: '100%', marginBottom: 24 }}>
            <h2>Movie Details 🔎</h2>
            <p>Get the full picture: Release date, Genre, Cast and Description all in one place.</p>
            <p>Add your own personal ratings and reviews which your friends can see.</p>
            <p>Movies that you rate above four stars will be considered worth a "watch" and shown to your friends.</p>
          </Card>
          <Card
            title={`Detailed View for "${johnDetails.title}"`}
            headStyle={{ color: 'black' }}
            extra={<Button style={buttonStyle} onClick={() => setCurrent(1)}>Back</Button>}
            style={{
              textAlign: 'left',
              backgroundColor: '#ddd',
              border: '1px solid #bbb',
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            <div style={{
              backgroundColor: '#ccc',
              padding: 24,
              borderRadius: 4,
              display: 'flex',
              gap: 20,
              flexDirection: screens.lg ? 'row' : 'column',
            }}>
              <div style={{ flex: '0 0 200px' }}>
                <img src={johnDetails.poster} alt={johnDetails.title} style={{ width: '100%', borderRadius: 4 }} />
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p><strong>Release Date:</strong> {johnDetails.releaseDate}</p>
                  <p><strong>Genre:</strong> {johnDetails.genre}</p>
                  <p><strong>Cast:</strong> {johnDetails.cast}</p>
                  <p><strong>Description:</strong></p>
                  <p>{johnDetails.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>TMDB Rating:</span>
                    <Rate disabled allowHalf defaultValue={johnDetails.tmdbRating} />
                    <span>({johnDetails.tmdbRating}/5)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>Your Rating:</span>
                    <Rate allowHalf value={userRating} onChange={val => { setUserRating(val); setShowReview(true); }} />
                    <span>({userRating}/5)</span>
                  </div>
                  {showReview && (
                    <div style={{ marginTop: 16 }}>
                      <Input.TextArea rows={3} placeholder="Write a review..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
                      <Button type="primary" style={{ ...buttonStyle, marginTop: 8 }} onClick={handleReviewSubmit}>
                        Submit Review
                      </Button>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                    <span>Average User Rating:</span>
                    <span>{johnDetails.avgUserRating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      ),
    },
    {
      title: 'Trending Now',
      content: (
        <Card hoverable style={{ width: '100%', marginBottom: 24 }}>
          <h2>Trending Now 🔥</h2>
          <p>Stay in the loop with the hottest titles right now this section shows the most-talked-about movies and shows, updated every hour in real time.</p>
          <p>Browse the list to discover new hits, then click Details or Add to Watchlist to dive deeper or save your faves.</p>
        </Card>
      ),
    },
    {
      title: 'Create Watchparty',
      content: (
        <Card hoverable style={{ width: '100%', marginBottom: 24 }}>
          <h2>Watch Party 📺</h2>
          <p>This section lets you organize virtual watch parties with friends. Set a title, date, time, and movie link, then send out invites. Once everyone is ready, a synchronized countdown ensures all viewers start watching at the same time. Engage with live chat, rate the content post-watch, and ensure no one misses a moment since all participants are in sync to the host!</p>
          <br />
          <p>Keep in mind we have full support for YouTube Videos, it will be shown directly in the lobby, however you can still use the Lobby Livechat and Readiness indicators if you have a different content-link.</p>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8 }}>
      <Steps current={current} style={{ marginBottom: 24 }}>
        {steps.map(item => <Step key={item.title} title={item.title} />)}
      </Steps>
      <div style={{ minHeight: 300 }}>{steps[current].content}</div>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Space>
          {current > 0 && <Button style={buttonStyle} onClick={prev}>Previous</Button>}
          {current < steps.length - 1 && <Button style={buttonStyle} onClick={next}>Next</Button>}
        </Space>
      </div>
    </div>
  );
}
