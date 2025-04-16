"use client"; // Enables React hooks

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { Button, Card, List } from "antd";
import InviteFriendsModal from "./InviteFriendsModal";
import useWatchPartyLocalStorage from "@/hooks/useWatchPartyLocalStorage"; // ✅ Using new modular storage

interface WatchParty {
  id: number;
  name: string;
  contentLink: string;
}

const WatchParty: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const { value: watchPartyUserId, set: setWatchPartyUserId } =
    useWatchPartyLocalStorage("id", ""); // ✅ Using modular storage
  const [watchParties, setWatchParties] = useState<WatchParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [inviteResponses, setInviteResponses] = useState<
    Record<number, string[]>
  >({}); // ✅ Stores invite responses

  // Fetch User ID from backend
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const username = localStorage.getItem("username"); // ✅ Get username if stored
        if (!username) {
          console.warn("Username not found in local storage, waiting...");
          return; // ✅ Prevents premature API calls
        }

        const response = await apiService.get<number>(
          `/watchparty/user-id/${username}`
        ); // ✅ Explicit type definition
        setWatchPartyUserId(response.toString()); // ✅ Fixes type mismatch (number -> string)
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch Watch Parties only when user ID is available
  useEffect(() => {
    if (!watchPartyUserId || watchPartyUserId === "") {
      console.warn("User ID not found yet, waiting...");
      return; // ✅ Prevents API call if user ID isn’t set yet
    }

    const fetchWatchParties = async () => {
      try {
        const data = await apiService.get<WatchParty[]>(
          `/watchparty/user/${watchPartyUserId}`
        );
        setWatchParties(data);
      } catch (error) {
        console.error("Error fetching watch parties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchParties();
  }, [watchPartyUserId]); // ✅ Ensures API call only happens when user ID is available

  // ✅ Polling Logic: Fetch latest invite responses every 5 seconds
  useEffect(() => {
    const fetchInviteResponses = async () => {
      try {
        const updatedResponses: Record<number, string[]> = {};
        for (const party of watchParties) {
          const responses = await apiService.get<string[]>(
            `/watchparty/${party.id}/latest-invite-status`
          );
          updatedResponses[party.id] = responses;
        }
        setInviteResponses(updatedResponses);
      } catch (error) {
        console.error("Error fetching invite responses:", error);
      }
    };

    const pollingInterval = setInterval(fetchInviteResponses, 5000); // ✅ Poll every 5 seconds
    return () => clearInterval(pollingInterval); // ✅ Cleanup polling on unmount
  }, [watchParties]); // ✅ Ensures polling is tied to watch party changes

  return (
    <div className="watch-party-list">
      <h2>Your Watch Parties</h2>
      <Button type="primary" onClick={() => router.push("/watchparty/create")}>
        Create New Watch Party
      </Button>
      <List
        loading={loading}
        dataSource={watchParties}
        renderItem={(party) => (
          <Card title={party.name} style={{ marginTop: 16 }}>
            <p>
              🎬 Watching:{" "}
              <a
                href={party.contentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {party.contentLink}
              </a>
            </p>
            <Button type="default" onClick={() => setSelectedPartyId(party.id)}>
              Invite Friends
            </Button>

            {/* ✅ Display invite responses dynamically below each watch party */}
            {inviteResponses[party.id] && (
              <div className="invite-status">
                <strong>Invite Responses:</strong>
                <ul>
                  {inviteResponses[party.id].map((response, index) => (
                    <li key={index}>{response}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      />

      {/* Invite Friends Modal */}
      {selectedPartyId && (
        <InviteFriendsModal
          watchPartyId={selectedPartyId}
          visible={true}
          onClose={() => setSelectedPartyId(null)}
        />
      )}
    </div>
  );
};

export default WatchParty;
