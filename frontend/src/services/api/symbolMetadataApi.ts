/**
 * API service for Symbol Metadata operations
 */

import type { AxiosInstance } from 'axios';
import axios from 'axios';

import type {
  SymbolMetadata,
  CreateSymbolMetadataRequest,
  UpdateSymbolMetadataRequest,
} from '@/types/symbolMetadata';

class SymbolMetadataApi {
  private api: AxiosInstance;
  private cache = new Map<string, { data: SymbolMetadata; timestamp: number }>();
  private readonly cacheTimeout = 15 * 60 * 1000; // 15 minutes matching backend

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get metadata by ID
   */
  async getById(id: string): Promise<SymbolMetadata> {
    const cacheKey = `id:${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const response = await this.api.get<SymbolMetadata>(`/api/symbolmetadata/${id}`);
    this.setCache(cacheKey, response.data);
    return response.data;
  }

  /**
   * Get metadata by symbol ID
   */
  async getBySymbolId(symbolId: string): Promise<SymbolMetadata | null> {
    const cacheKey = `symbol:${symbolId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get<SymbolMetadata>(
        `/api/symbolmetadata/symbol/${symbolId}`
      );
      this.setCache(cacheKey, response.data);
      this.setCache(`id:${response.data.id}`, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new metadata
   */
  async create(request: CreateSymbolMetadataRequest): Promise<SymbolMetadata> {
    const response = await this.api.post<SymbolMetadata>(
      '/api/symbolmetadata',
      request
    );

    // Cache the new metadata
    this.setCache(`id:${response.data.id}`, response.data);
    this.setCache(`symbol:${response.data.symbolId}`, response.data);

    return response.data;
  }

  /**
   * Update existing metadata
   */
  async update(request: UpdateSymbolMetadataRequest): Promise<SymbolMetadata> {
    const response = await this.api.put<SymbolMetadata>(
      `/api/symbolmetadata/${request.id}`,
      request
    );

    // Invalidate cache
    this.invalidateCache(response.data.id, response.data.symbolId);

    return response.data;
  }

  /**
   * Delete metadata
   */
  async delete(id: string): Promise<void> {
    // Get metadata first to clear all cache entries
    const metadata = await this.getById(id).catch(() => null);

    await this.api.delete(`/api/symbolmetadata/${id}`);

    // Clear cache
    if (metadata) {
      this.invalidateCache(metadata.id, metadata.symbolId);
    }
  }

  /**
   * Apply template to metadata
   */
  async applyTemplate(metadataId: string, templateId: string): Promise<SymbolMetadata> {
    const response = await this.api.post<SymbolMetadata>(
      `/api/symbolmetadata/${metadataId}/apply-template/${templateId}`
    );

    // Invalidate cache
    this.invalidateCache(response.data.id, response.data.symbolId);

    return response.data;
  }

  /**
   * Batch get metadata for multiple symbols
   */
  async getBatch(symbolIds: string[]): Promise<Map<string, SymbolMetadata>> {
    const result = new Map<string, SymbolMetadata>();
    const uncached: string[] = [];

    // Check cache first
    for (const symbolId of symbolIds) {
      const cached = this.getFromCache(`symbol:${symbolId}`);
      if (cached) {
        result.set(symbolId, cached);
      } else {
        uncached.push(symbolId);
      }
    }

    // Fetch uncached items
    if (uncached.length > 0) {
      // This would require a batch endpoint on the backend
      // For now, fetch individually
      await Promise.all(
        uncached.map(async (symbolId) => {
          const metadata = await this.getBySymbolId(symbolId);
          if (metadata) {
            result.set(symbolId, metadata);
          }
        })
      );
    }

    return result;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(key: string): SymbolMetadata | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache entry
   */
  private setCache(key: string, data: SymbolMetadata): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate cache entries
   */
  private invalidateCache(id: string, symbolId: string): void {
    this.cache.delete(`id:${id}`);
    this.cache.delete(`symbol:${symbolId}`);
  }
}

export const symbolMetadataApi = new SymbolMetadataApi();