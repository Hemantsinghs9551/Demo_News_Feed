// App.js
import React, { useEffect, useState, useCallback } from 'react';
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
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const API_KEY = '863633299253477f8c8134a02e767f96';
const PAGE_SIZE = 10;

export default function App() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  const fetchArticles = async (pageNum = 1, isRefresh = false, customQuery = searchQuery) => {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=${PAGE_SIZE}&page=${pageNum}&q=${customQuery}&apiKey=${API_KEY}`;
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

      if (isRefresh) {
        setSkeletonLoading(true);
      }
      setLoading(true);
      const res = await axios.get(url);
      const newArticles = res.data.articles;

      setHasMore(newArticles.length >= PAGE_SIZE);
      if (isRefresh) {
        setArticles(newArticles);
      } else {
        setArticles(prev => (pageNum === 1 ? newArticles : [...prev, ...newArticles]));
      }
      await AsyncStorage.setItem('cachedArticles', JSON.stringify(newArticles));
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSkeletonLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchArticles(1, true);
  };

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setPage(1);
    fetchArticles(1, true, searchQuery);
  };

  const renderLeftActions = () => (
    <View style={styles.swipeActionLike}><Text style={styles.swipeText}>👍 Like</Text></View>
  );
  const renderRightActions = () => (
    <View style={styles.swipeActionBookmark}><Text style={styles.swipeText}>🔖 Bookmark</Text></View>
  );

  const renderSkeleton = () => (
    <View style={styles.articleContainer}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonDesc} />
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <View style={styles.articleContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.description}</Text>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <FlatList
          data={skeletonLoading ? Array(5).fill({}) : articles}
          renderItem={skeletonLoading ? () => renderSkeleton() : renderItem}
          keyExtractor={(item, index) => item.title + index}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListFooterComponent={loading && !skeletonLoading ? <ActivityIndicator size="large" /> : null}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f8f8f8',
  },
  articleContainer: {
    padding: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  swipeActionLike: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-start',
    padding: 20,
  },
  swipeActionBookmark: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'flex-end',
    padding: 20,
  },
  swipeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skeletonTitle: {
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    borderRadius: 4,
  },
  skeletonDesc: {
    width: '100%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});