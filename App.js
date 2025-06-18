
import React, { useEffect, useState, useRef } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StyleSheet,
  Alert,
  Keyboard,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function App() {
  const { width, height } = useWindowDimensions();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const debounceRef = useRef(null);

  const padding = width * 0.04;
  const margin = width * 0.03;
  const fontSize = width * 0.045;
  const imageHeight = height * 0.25;

  const fetchArticles = async (isRefresh = false, query = '') => {
    const baseURL = 'https://newsapi.org/v2/top-headlines';
    const url = query
      ? `${baseURL}?q=${encodeURIComponent(query)}&apiKey=863633299253477f8c8134a02e767f96`
      : `${baseURL}?sources=techcrunch&apiKey=863633299253477f8c8134a02e767f96`;

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        const cached = await AsyncStorage.getItem('cachedArticles');
        if (cached) {
          setArticles(JSON.parse(cached));
        } else {
          Alert.alert('No Internet', 'Please connect to the internet.');
        }
        return;
      }

      if (isRefresh) setSkeletonLoading(true);
      else setLoading(true);

      const res = await axios.get(url);
      const newArticles = res.data.articles || [];

      setArticles(newArticles);
      await AsyncStorage.setItem('cachedArticles', JSON.stringify(newArticles));
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSkeletonLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchArticles(true, searchQuery);
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    fetchArticles(true, searchQuery);
  };

  const onSearchChange = (text) => {
    setSearchQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchArticles(true, text);
    }, 800);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const renderLeftActions = () => (
    <View style={[styles.swipeAction, { backgroundColor: '#4CAF50', padding }]}>
      <Text style={[styles.swipeText, { fontSize }]}>👍 Like</Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={[styles.swipeAction, { backgroundColor: '#2196F3', padding }]}>
      <Text style={[styles.swipeText, { fontSize }]}>🔖 Bookmark</Text>
    </View>
  );

  const renderSkeleton = () => (
    <View style={[styles.articleContainer, {
      width: width * 0.95,
      paddingHorizontal: padding,
      paddingVertical: padding,
      marginBottom: margin,
    }]}>
      <View style={[styles.skeletonBox, { height: imageHeight, width: '100%', marginBottom: margin }]} />
      <View style={[styles.skeletonBox, { height: fontSize * 1.2, width: '80%', marginBottom: margin / 2 }]} />
      <View style={[styles.skeletonBox, { height: fontSize, width: '95%' }]} />
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <View style={[styles.articleContainer, {
        width: width * 0.95,
        paddingHorizontal: padding,
        paddingVertical: padding,
        marginBottom: margin,
      }]}>
        {item.urlToImage ? (
          <Image
            source={{ uri: item.urlToImage }}
            style={{
              width: '100%',
              height: imageHeight,
              borderRadius: width * 0.02,
              marginBottom: margin,
              resizeMode: 'cover',
            }}
          />
        ) : null}
        <Text style={{ fontSize, fontWeight: 'bold', marginBottom: margin / 2 }}>{item.title}</Text>
        <Text style={{ fontSize: fontSize * 0.9 }}>{item.description}</Text>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeArea, {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }]}>
        <TextInput
          style={{
            width: width * 0.95,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: width * 0.02,
            backgroundColor: '#fff',
            paddingVertical: padding / 2,
            paddingHorizontal: padding,
            marginVertical: margin,
            fontSize
          }}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={onSearchChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />

        <FlatList
          data={skeletonLoading ? Array(5).fill({}) : articles}
          renderItem={skeletonLoading ? () => renderSkeleton() : renderItem}
          keyExtractor={(item, index) => (item.title || 'key') + index}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListFooterComponent={
            loading && !skeletonLoading ? <ActivityIndicator size="large" /> : null
          }
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  articleContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  swipeAction: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  swipeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skeletonBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});
