"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function JoinTripComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Validating invitation...");
  const [error, setError] = useState("");

  useEffect(() => {
    const acceptInvite = async () => {
      const invitationToken = searchParams.get("token");
      if (!invitationToken) {
        setStatus("Invalid invitation link.");
        setError("No invitation token was found in the URL.");
        return;
      }

      const authToken = localStorage.getItem("token");
      if (!authToken) {
        setStatus("Redirecting to login...");
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      setStatus("Joining trip...");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invitations/accept`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token: invitationToken }),
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setStatus("Authentication failed. Redirecting to login...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            const currentPath =
              window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
          }
          const errorResult = await response.json();
          throw new Error(
            errorResult.error ||
              `Server responded with status ${response.status}`
          );
        }

        const result = await response.json();

        if (result.data?.tripId) {
          setStatus("Success! Redirecting you to the trip planner...");
          router.push(`/planner/${result.data.tripId}`);
        } else {
          throw new Error(result.error || "Failed to join the trip.");
        }
      } catch (err) {
        setStatus("Could not join trip.");
        setError(err.message);
      }
    };

    acceptInvite();
  }, [router, searchParams]);

  return (
    <div
      style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h1>{status}</h1>
      {error && (
        <p style={{ color: "red", maxWidth: "600px", margin: "auto" }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}

export default function JoinTripPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>
      }
    >
      <JoinTripComponent />
    </Suspense>
  );
}
