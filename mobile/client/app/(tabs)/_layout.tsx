import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

export default function TabLayout() {
  const { session, user, loading, fetchUserProfile } = useAuth();

  // Fetch user profile on mount to ensure we have latest age
  useEffect(() => {
    if (session?.token && !user?.age) {
      fetchUserProfile();
    }
  }, [session?.token]);

  // Determine user age from session or user object
  const userAge = user?.age || session?.user?.age;
  const isChild = userAge && userAge < 13;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ddd',
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
      }}>
      
      {/* Children Mode (age < 13) */}
      {isChild ? (
        <>
          <Tabs.Screen
            name="stories"
            options={{
              title: 'Stories',
              tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="mood-tracker"
            options={{
              title: 'Mood',
              tabBarIcon: ({ color }) => <FontAwesome name="smile-o" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="quizzes"
            options={{
              title: 'Quizzes',
              tabBarIcon: ({ color }) => <FontAwesome name="graduation-cap" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="leaderboard"
            options={{
              title: 'Leaderboard',
              tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
            }}
          />
        </>
      ) : (
        /* Teenager Mode (age >= 13) */
        <>
          <Tabs.Screen
            name="query"
            options={{
              title: 'Query',
              tabBarIcon: ({ color }) => <FontAwesome name="search" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="expression"
            options={{
              title: 'Expression',
              tabBarIcon: ({ color }) => <FontAwesome name="heart" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="journal"
            options={{
              title: 'Journal',
              tabBarIcon: ({ color }) => <FontAwesome name="circle" size={24} color={color} />,
            }}
          />
          
          <Tabs.Screen
            name="group"
            options={{
              title: 'Group',
              tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
            }}
          />
        </>
      )}
    </Tabs>
  );
}
