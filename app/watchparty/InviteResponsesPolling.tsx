import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

interface PollingProps {
  watchParties: { id: number; title: string }[]; // Include title in the watch parties interface
}

const InviteResponsesPolling: React.FC<PollingProps> = ({ watchParties }) => {
  const apiService = useApi();
  const [inviteResponses, setInviteResponses] = useState<
    Record<string, string[]>
  >({}); // Use title (string) as the key instead of party ID (number)

  useEffect(() => {
    const fetchInviteResponses = async () => {
      try {
        const updatedResponses: Record<string, string[]> = {}; // Use watch party titles as keys
        for (const party of watchParties) {
          const responses = await apiService.get<string[]>(
            `/api/watchparties/${party.id}/latest-invite-status`
          ); // Retrieve responses using party ID from the backend
          updatedResponses[party.title] = responses; // Map responses to the title
        }
        setInviteResponses(updatedResponses); // Update state with title-based mapping
      } catch (error) {
        console.error("Error fetching invite responses:", error);
      }
    };

    const pollingInterval = setInterval(fetchInviteResponses, 5000); // Poll every 5 seconds
    return () => clearInterval(pollingInterval); // Cleanup polling on unmount
  }, [watchParties]);

  return (
    <div style={{ color: "#fff", padding: "10px" }}>
      {Object.entries(inviteResponses).map(([partyTitle, responses]) => (
        <div
          key={partyTitle}
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #007BFF",
            borderRadius: "8px",
            backgroundColor: "#1e1e1e",
          }}
        >
          <h3 style={{ color: "#00FF7F", marginBottom: "10px" }}>
            Responses for {partyTitle}:
          </h3>
          <ul style={{ paddingLeft: "20px" }}>
            {responses.map((response, index) => (
              <li
                key={index}
                style={{
                  fontWeight: "bold",
                  color: response.includes("accepted")
                    ? "#4CAF50" // Green for accepted
                    : response.includes("declined")
                    ? "#FF5722" // Red for declined
                    : "#FFD700", // Yellow for other statuses
                }}
              >
                {response}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default InviteResponsesPolling;
