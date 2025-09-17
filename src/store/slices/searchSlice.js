import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchAPI } from '../../utils/api';

// Function to highlight search terms in text
const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">$1</mark>');
};

const initialState = {
  // Search results
  results: {
    hits: [],
    totalHits: 0,
    page: 1,
    totalPages: 0,
    processingTimeMs: 0
  },
  
  // Grouped results
  groupedResults: {
    threads: [],
    blogs: [],
    articles: [],
    totalHits: 0,
    processingTimeMs: 0
  },
  
  // Suggestions
  suggestions: [],
  
  // Similar content
  similarContent: [],
  
  // Search state
  query: '',
  loading: false,
  suggestionsLoading: false,
  error: null,
  
  // Filters and options
  filters: {
    type: 'all',
    categoryId: null,
    authorId: null,
    dateFrom: null,
    dateTo: null
  },
  
  sortBy: 'relevance',
  currentPage: 1,
  itemsPerPage: 20
};

// Async thunks
export const searchContent = createAsyncThunk(
  'search/searchContent',
  async ({ query, options = {} }, { rejectWithValue }) => {
    try {
      const response = await searchAPI.search(query, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchGrouped = createAsyncThunk(
  'search/searchGrouped',
  async ({ query, options = {} }, { rejectWithValue }) => {
    try {
      const response = await searchAPI.searchGrouped(query, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'search/getSuggestions',
  async ({ prefix, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log('getSuggestions called with:', { prefix, limit });
      const response = await searchAPI.getSuggestions(prefix, limit);
      console.log('getSuggestions response:', response);
      return response;
    } catch (error) {
      console.error('getSuggestions error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getSimilarContent = createAsyncThunk(
  'search/getSimilarContent',
  async ({ id, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await searchAPI.getSimilar(id, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const indexAllContent = createAsyncThunk(
  'search/indexAllContent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchAPI.indexAllContent();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = initialState.results;
      state.groupedResults = initialState.groupedResults;
      state.similarContent = [];
    },
    
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
    
    resetSearch: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Search content
      .addCase(searchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.loading = false;
        // Process search results to highlight search terms
        const searchTerm = action.payload.query.toLowerCase();
        const processedResults = {
          ...action.payload.data,
          hits: action.payload.data.hits.map(result => ({
            ...result,
            _formatted: {
              ...result._formatted,
              title: result._formatted?.title || highlightSearchTerm(result.title, searchTerm)
            }
          }))
        };
        state.results = processedResults;
        state.query = action.payload.query;
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search grouped
      .addCase(searchGrouped.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGrouped.fulfilled, (state, action) => {
        state.loading = false;
        // Process grouped search results to highlight search terms
        const searchTerm = action.payload.query.toLowerCase();
        const processedGroupedResults = {
          ...action.payload.data,
          threads: action.payload.data.threads?.map(result => ({
            ...result,
            _formatted: {
              ...result._formatted,
              title: result._formatted?.title || highlightSearchTerm(result.title, searchTerm)
            }
          })) || [],
          blogs: action.payload.data.blogs?.map(result => ({
            ...result,
            _formatted: {
              ...result._formatted,
              title: result._formatted?.title || highlightSearchTerm(result.title, searchTerm)
            }
          })) || [],
          articles: action.payload.data.articles?.map(result => ({
            ...result,
            _formatted: {
              ...result._formatted,
              title: result._formatted?.title || highlightSearchTerm(result.title, searchTerm)
            }
          })) || []
        };
        state.groupedResults = processedGroupedResults;
        state.query = action.payload.query;
      })
      .addCase(searchGrouped.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get suggestions
      .addCase(getSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
        state.error = null;
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        console.log('Suggestions fulfilled:', action.payload);
        // Process suggestions to ensure they have the right format and highlight search terms
        const searchTerm = action.payload.prefix.toLowerCase();
        state.suggestions = action.payload.data.map(suggestion => {
          const title = suggestion.title || suggestion.highlightedTitle || '';
          const highlightedTitle = highlightSearchTerm(title, searchTerm);
          
          return {
            ...suggestion,
            title: title,
            highlightedTitle: highlightedTitle
          };
        });
      })
      .addCase(getSuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.error = action.payload;
      })
      
      // Get similar content
      .addCase(getSimilarContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimilarContent.fulfilled, (state, action) => {
        state.loading = false;
        state.similarContent = action.payload.data;
      })
      .addCase(getSimilarContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Index all content
      .addCase(indexAllContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(indexAllContent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(indexAllContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSearchResults,
  clearSuggestions,
  clearError,
  setQuery,
  setFilters,
  setSortBy,
  setCurrentPage,
  setItemsPerPage,
  resetSearch
} = searchSlice.actions;

export default searchSlice.reducer;
