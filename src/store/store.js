import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';
import forumSlice from './slices/forumSlice';
import blogSlice from './slices/blogSlice';
import articleSlice from './slices/articleSlice';
import adminSlice from './slices/adminSlice';
import likesSlice from './slices/likesSlice';
import notificationSlice from './slices/notificationSlice';
import homeSlice from './slices/homeSlice';
import searchSlice from './slices/searchSlice';
import profileSlice from './slices/profileSlice';
import categorySlice from './slices/categorySlice';
import threadDetailSlice from './slices/threadDetailSlice';
import blogDetailSlice from './slices/blogDetailSlice';
import articleDetailSlice from './slices/articleDetailSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    theme: themeSlice,
    forum: forumSlice,
    blog: blogSlice,
    article: articleSlice,
    admin: adminSlice,
    likes: likesSlice,
    notifications: notificationSlice,
    home: homeSlice,
    search: searchSlice,
    profile: profileSlice,
    category: categorySlice,
    threadDetail: threadDetailSlice,
    blogDetail: blogDetailSlice,
    articleDetail: articleDetailSlice,
  },
});