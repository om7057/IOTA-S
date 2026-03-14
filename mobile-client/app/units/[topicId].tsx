import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

type Unit = {
  id: string;
  title: string;
  description?: string;
  order: number;
};

type Lesson = {
  id: string;
  title: string;
  description?: string;
  unitId: string;
  order: number;
  Challenges?: { id: string }[];
};

export default function UnitsScreen() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams();
  const { session } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.token && topicId) {
      fetchUnits();
    }
  }, [session?.token, topicId]);

  useEffect(() => {
    if (selectedUnit && session?.token) {
      fetchLessons(selectedUnit.id);
    }
  }, [selectedUnit, session?.token]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/units/topic/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch units');
      }

      const data = await response.json();
      setUnits(data);
      if (data.length > 0) {
        setSelectedUnit(data[0]);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      Alert.alert('Error', 'Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (unitId: string) => {
    try {
      const response = await fetch(`${API_URL}/lessons/unit/${unitId}`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    }
  };

  const renderUnitItem = ({ item }: { item: Unit }) => (
    <TouchableOpacity
      style={[
        styles.unitCard,
        selectedUnit?.id === item.id && styles.unitCardActive,
      ]}
      onPress={() => setSelectedUnit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.unitContent}>
        <Ionicons
          name="book-outline"
          size={28}
          color={selectedUnit?.id === item.id ? '#ffffff' : '#4b7bec'}
        />
        <View style={styles.unitText}>
          <Text
            style={[
              styles.unitTitle,
              selectedUnit?.id === item.id && styles.unitTitleActive,
            ]}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text
              style={[
                styles.unitDescription,
                selectedUnit?.id === item.id && styles.unitDescriptionActive,
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLessonItem = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => router.push(`/lesson/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.lessonContent}>
        <View style={styles.lessonIcon}>
          <Text style={styles.lessonIconText}>
            {lessons.indexOf(item) + 1}
          </Text>
        </View>
        <View style={styles.lessonText}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.lessonDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.lessonMeta}>
            {item.Challenges?.length || 0} challenges
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4b7bec" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="#4b7bec" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Units</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Units List */}
      <ScrollView style={styles.unitsContainer}>
        <Text style={styles.sectionTitle}>Select a Unit</Text>
        {units.map((unit) => (
          <View key={unit.id}>{renderUnitItem({ item: unit })}</View>
        ))}
      </ScrollView>

      {/* Lessons for Selected Unit */}
      {selectedUnit && (
        <View style={styles.lessonsContainer}>
          <Text style={styles.sectionTitle}>
            Lessons in {selectedUnit.title}
          </Text>
          <FlatList
            data={lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No lessons available</Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  unitsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lessonsContainer: {
    maxHeight: 400,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  unitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  unitCardActive: {
    backgroundColor: '#4b7bec',
    borderColor: '#4b7bec',
  },
  unitContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  unitText: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  unitTitleActive: {
    color: '#ffffff',
  },
  unitDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  unitDescriptionActive: {
    color: '#e5e7eb',
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b7bec',
  },
  lessonText: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  lessonMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 12,
  },
});
