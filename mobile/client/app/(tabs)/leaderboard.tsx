import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  score: number;
  rank: number;
};

export default function LeaderboardScreen() {
  const { session } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session?.token) {
      fetchLeaderboard();
    }
  }, [session?.token]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/leaderboards`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data || []);

      // Find current user's position
      const currentUser = data.find((entry: LeaderboardEntry) => entry.user_id === session?.user?.id);
      setUserRank(currentUser || null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.user_id === session?.user?.id;
    return (
      <View
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
        ]}
      >
        <View style={styles.rankContainer}>
          {getMedalIcon(item.rank) ? (
            <Text style={styles.medalEmoji}>{getMedalIcon(item.rank)}</Text>
          ) : (
            <Text style={styles.rankNumber}>{item.rank}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.display_name}</Text>
          <Text style={styles.score}>{item.score} points</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
      </View>
    );
  };

  if (loading && leaderboard.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b7bec" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>See how you rank among friends! 🏆</Text>
      </View>

      {/* Current User Rank */}
      {userRank && (
        <View style={styles.currentUserCard}>
          <View style={styles.currentUserContent}>
            <Text style={styles.currentUserLabel}>Your Rank</Text>
            <Text style={styles.currentUserRank}>#{userRank.rank}</Text>
            <Text style={styles.currentUserScore}>{userRank.score} points</Text>
          </View>
          <View style={styles.currentUserPodium}>
            <Ionicons name="podium" size={48} color="#FFC107" />
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4b7bec" />
        </View>
      ) : leaderboard.length > 0 ? (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.leaderboardList}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4b7bec']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="podium-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No leaderboard data</Text>
          <Text style={styles.emptySubtext}>Start playing quizzes to climb the rankings!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#4b7bec',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3867d6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  currentUserCard: {
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#FFF8DC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currentUserContent: {
    flex: 1,
  },
  currentUserLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  currentUserRank: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFC107',
    marginVertical: 4,
  },
  currentUserScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  currentUserPodium: {
    marginLeft: 10,
  },
  leaderboardList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  leaderboardItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#4b7bec',
  },
  rankContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4b7bec',
  },
  medalEmoji: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  score: {
    fontSize: 12,
    color: '#999',
  },
  scoreBox: {
    backgroundColor: '#4b7bec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
