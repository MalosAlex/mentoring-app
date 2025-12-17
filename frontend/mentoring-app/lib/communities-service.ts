import { getStoredToken } from "./auth-service";
import { API_BASE_URL } from "./helper";
import { Community } from "./types";

type CommunityResponse = {
  id: number;
  name: string;
  description: string;
  isJoined: boolean;
  memberCount: number;
};

export async function getAllCommunities(): Promise<Community[]> {
  const stored = getStoredToken();
  if (!stored) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${API_BASE_URL}/Communities`, {
    headers: {
      Authorization: `Bearer ${stored.token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch communities");
  }

  const data: CommunityResponse[] = await response.json();

  return data.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    memberCount: item.memberCount ?? 0,
    isJoined: item.isJoined,
  }));
}

export async function joinCommunity(communityId: string): Promise<void> {
  const stored = getStoredToken();
  if (!stored) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${API_BASE_URL}/Communities/${communityId}/join`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stored.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to join community");
  }
}

export async function leaveCommunity(communityId: string): Promise<void> {
  const stored = getStoredToken();
  if (!stored) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${API_BASE_URL}/Communities/${communityId}/leave`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stored.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to leave community");
  }
}
