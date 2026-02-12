import { useState, useEffect } from 'react';

// Define types for our data
interface Player {
  user_id: number;
  username: string;
  total_score: string; // BigInt comes as string usually from JSON
}

interface RankResult {
  userId: number;
  rank: number;
  totalScore: string;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPlayers = async () => {
    try {
      const response = await fetch('/api/leaderboard/top');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Implement Short Polling (refresh every 5 seconds)
  useEffect(() => {
    fetchTopPlayers(); // Initial fetch
    const intervalId = setInterval(fetchTopPlayers, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const submitScore = async (userId: number, score: number) => {
    try {
      const response = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      // Optimistic update could go here, but with short polling we'll see it soon
      // Or we can manually trigger a fetch
      fetchTopPlayers();
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const checkRank = async (userId: number): Promise<RankResult> => {
    const response = await fetch(`/api/leaderboard/rank/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rank');
    }
    return await response.json();
  };

  return { leaderboard, loading, error, submitScore, checkRank };
}
