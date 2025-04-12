"use client"; // Enables React hooks

import WatchParty from "./components/WatchParty"; // Import Watch Party component

const WatchPartyPage: React.FC = () => {
  return (
    <div className="watch-party-page">
      <h1>🎉 Watch Party Dashboard</h1>
      <WatchParty /> {/* Load watch party list */}
    </div>
  );
};

export default WatchPartyPage;
