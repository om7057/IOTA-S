import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useUserProfile } from '../contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';

export default function AgeSelectionScreen() {
  const { setUserAge, loading } = useUserProfile();
  const [selectedRange, setSelectedRange] = useState<'child' | 'teen' | null>(null);
  const [customAge, setCustomAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelection = async (range: 'child' | 'teen') => {
    setSelectedRange(range);
    let age = range === 'child' ? 10 : 16;
    
    if (customAge && /^\d+$/.test(customAge)) {
      age = parseInt(customAge);
      if (age < 8 || age > 19) {
        Alert.alert('Invalid Age', 'Please enter an age between 8 and 19');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await setUserAge(age);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set age');
      setSelectedRange(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-sky-50">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-12 mt-8">
          <Text className="text-5xl mb-4">🎯</Text>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome!</Text>
          <Text className="text-lg text-gray-600 text-center">
            Tell us your age range so we can personalize your experience
          </Text>
        </View>

        {/* Age Range Options */}
        <View className="space-y-4 mb-8">
          {/* Kids Option */}
          <TouchableOpacity
            onPress={() => handleSelection('child')}
            disabled={isSubmitting || loading}
            className={`p-6 rounded-2xl border-3 ${
              selectedRange === 'child'
                ? 'bg-yellow-100 border-yellow-400'
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-5xl mr-4">👶</Text>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">I'm a Kid</Text>
                <Text className="text-gray-600">Ages 8-12</Text>
              </View>
              {selectedRange === 'child' && (
                <Ionicons name="checkmark-circle" size={28} color="#10b981" />
              )}
            </View>
            <Text className="text-gray-700 text-sm">
              Fun stories, games, and emotions tracking designed just for you!
            </Text>
          </TouchableOpacity>

          {/* Teen Option */}
          <TouchableOpacity
            onPress={() => handleSelection('teen')}
            disabled={isSubmitting || loading}
            className={`p-6 rounded-2xl border-3 ${
              selectedRange === 'teen'
                ? 'bg-purple-100 border-purple-400'
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-5xl mr-4">🧑</Text>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">I'm a Teen</Text>
                <Text className="text-gray-600">Ages 13+</Text>
              </View>
              {selectedRange === 'teen' && (
                <Ionicons name="checkmark-circle" size={28} color="#10b981" />
              )}
            </View>
            <Text className="text-gray-700 text-sm">
              Explore challenges, build connections, and develop emotional intelligence
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Age Input */}
        {selectedRange && (
          <View className="mb-8 p-4 bg-white rounded-2xl border-2 border-sky-200">
            <Text className="text-gray-700 font-semibold mb-3">Or enter your exact age:</Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 bg-gray-100 rounded-lg px-4 py-3 flex-row items-center">
                <Text className="text-gray-500 text-lg mr-2">Age:</Text>
                <Text className="flex-1 text-lg font-semibold">{customAge || (selectedRange === 'child' ? '10' : '16')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const current = customAge ? parseInt(customAge) : (selectedRange === 'child' ? 10 : 16);
                  if (current > 8) setCustomAge((current - 1).toString());
                }}
                className="bg-sky-600 p-3 rounded-lg"
              >
                <Ionicons name="remove" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const current = customAge ? parseInt(customAge) : (selectedRange === 'child' ? 10 : 16);
                  if (current < 19) setCustomAge((current + 1).toString());
                }}
                className="bg-sky-600 p-3 rounded-lg"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submit Button */}
        {selectedRange && (
          <TouchableOpacity
            onPress={() => handleSelection(selectedRange)}
            disabled={isSubmitting || loading}
            className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl py-4 items-center flex-row justify-center gap-2"
          >
            {(isSubmitting || loading) ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold text-lg">Setting up...</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-bold text-lg">Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
