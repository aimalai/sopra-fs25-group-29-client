"use client";

import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRouter } from "next/navigation";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useApi } from "@/hooks/useApi";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId] = useSessionStorage<number>("userId", 0);
  const router = useRouter();
  const api = useApi();

  useEffect(() => {
    if (!userId) return;

    const isDev = process.env.NODE_ENV === "development";
    const host = isDev
      ? ""
      : "https://sopra-fs25-group-29-server.oa.r.appspot.com";

    const socket = new SockJS(`${host}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications.${userId}`, (msg) => {
        const { type, message, link } = JSON.parse(msg.body) as {
          type: string;
          message: string;
          link: string;
        };

        const toastOptions = { closeButton: true, closeOnClick: false };

        if (type === "friendRequest") {
          toast(
            <span>
              You have received a friend request. Click{" "}
              <span
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
                onClick={() => link && router.push(link)}
              >
                here
              </span>{" "}
              to view it!
            </span>,
            toastOptions
          );
        } else if (type === "chatMessage") {
          toast(
            <span>
              {message} Click{" "}
              <span
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
                onClick={() => link && router.push(link)}
              >
                here
              </span>{" "}
              to view it!
            </span>,
            toastOptions
          );
        } else if (type === "watchParty") {
          const partyId = link;
          toast(
            <span>
              {message} Alternatively,{" "}
              <span
                style={{
                  color: "green",
                  textDecoration: "underline",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await api.get(
                      `/api/watchparties/${partyId}/invite-response?status=accepted`
                    );
                    console.log("Invite-Response success:", res);
                    toast.success("You accepted the invitation!");
                    setTimeout(() => router.push("/watchparty"), 300);
                  } catch {
                    toast.error("Failed to accept the invitation.");
                  }
                }}
              >
                accept
              </span>{" "}
              or{" "}
              <span
                style={{
                  color: "red",
                  textDecoration: "underline",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await api.get(
                      `/api/watchparties/${partyId}/invite-response?status=declined`
                    );
                    toast.success("You declined the invitation!");
                  } catch {
                    toast.error("Failed to decline the invitation.");
                  }
                }}
              >
                decline
              </span>{" "}
              the invitation directly!
            </span>,
            toastOptions
          );
        } else {
          toast(message, {
            onClick: () => link && router.push(link),
            closeButton: true,
          });
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [userId, api, router]);

  return <>{children}</>;
}
