async function fetchUserById(id: string) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

async function fetchUserStats(id: string) {
  const response = await fetch(`/api/users/${id}/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch user stats");
  }
  return response.json();
}

const UserService = {
  fetchUserById,
  fetchUserStats,
};

export default UserService;
