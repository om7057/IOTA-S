import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { API_URL } from '../../constants';

export default function ProfileScreen() {
  const { signOut, session } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    display_name: '',
    age: '',
    gender: ''
  });

  useEffect(() => {
    // First fetch user data, then verification status, then analysis data
    const loadData = async () => {
      try {
        if (session?.user?.id) {
          console.log('Session and user ID available, loading data...');
          // First fetch user data
          await fetchUserData();
          console.log('User data loaded, fetching verification status...');
          // Then fetch verification status
          await fetchVerificationStatus();
          console.log('Verification status loaded, fetching analysis data...');
          // Finally fetch analysis data
          await fetchAnalysisData();
          console.log('All data loaded successfully');
        } else {
          console.log('No session or user ID available');
          setLoading(false);
          setVerificationLoading(false);
          setAnalysisLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        setVerificationLoading(false);
        setAnalysisLoading(false);
      }
    };
    
    loadData();
  }, [session]);

  // Update editedProfile when userData changes
  useEffect(() => {
    if (userData) {
      setEditedProfile({
        display_name: userData.display_name || '',
        age: userData.age?.toString() || '',
        gender: userData.gender || ''
      });
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      if (!session?.user?.id) return;

      console.log('Fetching user data for:', session.user.id);
      const response = await fetch(`${API_URL}/users/${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      console.log('User data received:', data);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) return;

      const response = await fetch(`${API_URL}/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_name: editedProfile.display_name,
          age: editedProfile.age ? parseInt(editedProfile.age) : null,
          gender: editedProfile.gender
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refresh the user data
      await fetchUserData();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisData = async () => {
    try {
      if (!session?.user?.id) return;

      // We need to add a new endpoint to the server to fetch analysis results
      const response = await fetch(`${API_URL}/users/${session.user.id}/analysis`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      // Don't show an alert as this might be a new feature
    } finally {
      setAnalysisLoading(false);
    }
  };
  const fetchVerificationStatus = async () => {
    try {
      setVerificationLoading(true);
      
      if (!session?.access_token) {
        console.log('No access token available');
        return;
      }

      console.log('Fetching verification status...');
      const response = await fetch(`${API_URL}/users/verification-status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch verification status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Verification status received:', data);
      setVerificationStatus(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      // Don't show alert to avoid spamming the user
    } finally {
      setVerificationLoading(false);
    }
  };
  const checkVerificationEligibility = async () => {
    try {
      setCheckingVerification(true);
      if (!session?.user?.id) return;

      const response = await fetch(`${API_URL}/users/${session.user.id}/verify-eligibility`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.eligible) {
          Alert.alert(
            'Verification Eligible',
            'You are eligible for verification! Would you like to verify your account now?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Verify Now',
                onPress: requestVerification,
              },
            ]
          );
        } else {
          Alert.alert(
            'Not Eligible',
            `${data.reason}. You need at least one post with 2 or more likes.`
          );
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to check verification eligibility');
      }
    } catch (error) {
      console.error('Error checking verification eligibility:', error);
      Alert.alert('Error', 'Failed to check verification eligibility');
    } finally {
      setCheckingVerification(false);
    }
  };

  const requestVerification = async () => {
    try {
      setCheckingVerification(true);
      if (!session?.user?.id) return;

      const response = await fetch(`${API_URL}/users/${session.user.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success',
          'Your account has been verified successfully!'
        );
        // Refresh verification status
        fetchVerificationStatus();
      } else {
        Alert.alert('Error', data.error || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      Alert.alert('Error', 'Failed to verify account');
    } finally {
      setCheckingVerification(false);
    }
  };

  // Helper function to get color based on emotion
  const getEmotionColor = (emotion: string): string => {
    const emotions: Record<string, string> = {
      'Happy': '#4CAF50',
      'Sad': '#2196F3',
      'Angry': '#F44336',
      'Anxious': '#FF9800',
      'Neutral': '#9E9E9E',
      // Add more emotions and colors as needed
    };
    
    return emotions[emotion] || '#9E9E9E';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person-circle" size={90} color="#262626" />
          {verificationStatus?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.username}>{userData?.display_name || 'User'}</Text>
        {verificationStatus?.isVerified && (
          <View style={styles.verifiedPill}>
            <Ionicons name="checkmark-circle" size={14} color="#0095f6" />
            <Text style={styles.verifiedPillText}>Verified</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : userData ? (
        <View style={styles.profileInfo}>
          <View style={styles.infoCard}>
            <View style={styles.infoSection}>
              <Text style={styles.label}>Display Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.display_name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, display_name: text }))}
                  placeholder="Enter your display name"
                />
              ) : (
                <Text style={styles.value}>{userData.display_name}</Text>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Age</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.age}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, age: text }))}
                  placeholder="Enter your age"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>{userData.age || 'Not set'}</Text>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Gender</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.gender}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, gender: text }))}
                  placeholder="Enter your gender"
                />
              ) : (
                <Text style={styles.value}>{userData.gender || 'Not set'}</Text>
              )}
            </View>

            {/* Update/Save buttons moved here, below gender and above email */}
            {isEditing ? (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]} 
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]} 
                  onPress={() => {
                    setIsEditing(false);
                    setEditedProfile({
                      display_name: userData.display_name || '',
                      age: userData.age?.toString() || '',
                      gender: userData.gender || ''
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Not available'}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.verificationHeader}>
                <Text style={styles.label}>Verification Status</Text>
                {!verificationLoading && !verificationStatus?.isVerified && (
                  <TouchableOpacity 
                    style={styles.checkEligibilityButton} 
                    onPress={checkVerificationEligibility}
                    disabled={checkingVerification}
                  >
                    <Text style={styles.checkEligibilityText}>
                      {checkingVerification ? 'Checking...' : 'Check Eligibility'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {verificationLoading ? (
                <Text style={styles.loadingText}>Loading status...</Text>
              ) : (
                <View style={styles.verificationStatusInfo}>
                  <View style={[
                    styles.statusIndicator, 
                    {backgroundColor: verificationStatus?.isVerified ? '#0095f6' : '#8e8e8e'}
                  ]} />
                  <Text style={[
                    styles.value,
                    {color: verificationStatus?.isVerified ? '#0095f6' : '#8e8e8e'}
                  ]}>
                    {verificationStatus?.isVerified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noProfile}>
          <Text style={styles.noProfileText}>No profile found</Text>
        </View>
      )}

      {/* Analysis Results Section */}
      <View style={styles.analysisSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Journal Analysis</Text>
        </View>
        
        {analysisLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analysis data...</Text>
          </View>
        ) : analysisData.length > 0 ? (
          analysisData.map((item, index) => (
            <View key={index} style={styles.analysisCard}>
              <View style={styles.analysisCardHeader}>
                <View style={[styles.emotionChip, { backgroundColor: getEmotionColor(item.detected_emotion) }]}>
                  <Text style={styles.emotionText}>{item.detected_emotion}</Text>
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(item.confidence_score * 100)}% confidence
                </Text>
              </View>
              
              <View style={styles.analysisContent}>
                <Text style={styles.queryText} numberOfLines={2} ellipsizeMode="tail">
                  {item.query_text}
                </Text>
                
                <View style={styles.topicContainer}>
                  <Text style={styles.topicText}>Topic: {item.extracted_topic}</Text>
                </View>
                
                <Text style={styles.feedbackText}>{item.personalized_feedback}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noAnalysis}>
            <Ionicons name="document-text-outline" size={44} color="#8e8e8e" />
            <Text style={styles.noAnalysisText}>No journal entries analyzed yet</Text>
            <Text style={styles.noAnalysisSubtext}>
              Add journal entries and use the analyze feature to see insights here
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0095f6',
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  verifiedPillText: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  profileInfo: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  infoSection: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#efefef',
  },
  label: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: '#262626',
    fontWeight: '400',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#efefef',
  },
  actionButton: {
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#0095f6',
    margin: 16,
  },
  saveButton: {
    backgroundColor: '#0095f6',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#8e8e8e',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  noProfile: {
    padding: 30,
    alignItems: 'center',
  },
  noProfileText: {
    fontSize: 16,
    color: '#8e8e8e',
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  checkEligibilityButton: {
    backgroundColor: 'transparent',
  },
  checkEligibilityText: {
    color: '#0095f6',
    fontSize: 12,
    fontWeight: '600',
  },
  // Analysis Section Styles
  analysisSection: {
    paddingTop: 16,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#efefef',
  },
  analysisCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emotionChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  emotionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  analysisContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  queryText: {
    fontSize: 14,
    color: '#262626',
    marginBottom: 12,
  },
  topicContainer: {
    marginBottom: 10,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#262626',
  },
  feedbackText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 20,
  },
  noAnalysis: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noAnalysisText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginTop: 16,
    marginBottom: 8,
  },
  noAnalysisSubtext: {
    fontSize: 14,
    color: '#8e8e8e',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    color: '#262626',
    backgroundColor: '#fafafa',
  },
  signOutButton: {
    margin: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ed4956',
    fontWeight: '600',
    fontSize: 14,
  },
});