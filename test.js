#!/usr/bin/env node

import { jest } from '@jest/globals';
import {
  handleGeocode,
  handleReverseGeocode,
  handlePlaceSearch,
  handlePlaceDetails,
  handleDistanceMatrix,
  handleElevation,
  handleDirections
} from './index.js';

describe('Google Maps API Handlers', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleGeocode', () => {
    const mockGeocodeResponse = {
      status: 'OK',
      results: [{
        place_id: 'test_place_id',
        formatted_address: 'Test Address',
        geometry: {
          location: { lat: 37.7749, lng: -122.4194 }
        }
      }]
    };

    it('should handle successful geocoding', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockGeocodeResponse)
      });

      const result = await handleGeocode('Test Address');
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.location).toEqual({ lat: 37.7749, lng: -122.4194 });
    });

    it('should handle geocoding errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'ZERO_RESULTS' })
      });

      const result = await handleGeocode('Invalid Address');
      expect(result.isError).toBe(true);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await handleGeocode('Test Address');
      expect(result.isError).toBe(true);
    });
  });

  describe('handleReverseGeocode', () => {
    const mockReverseGeocodeResponse = {
      status: 'OK',
      results: [{
        formatted_address: 'Test Address',
        place_id: 'test_place_id',
        address_components: []
      }]
    };

    it('should handle successful reverse geocoding', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockReverseGeocodeResponse)
      });

      const result = await handleReverseGeocode(37.7749, -122.4194);
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.formatted_address).toBe('Test Address');
    });

    it('should handle invalid coordinates', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'INVALID_REQUEST' })
      });

      const result = await handleReverseGeocode(-91, 181);
      expect(result.isError).toBe(true);
    });
  });

  describe('handlePlaceSearch', () => {
    const mockPlacesResponse = {
      status: 'OK',
      results: [{
        name: 'Test Place',
        place_id: 'test_place_id',
        formatted_address: 'Test Address',
        geometry: { location: { lat: 37.7749, lng: -122.4194 } },
        rating: 4.5,
        types: ['restaurant']
      }]
    };

    it('should handle successful place search with location', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockPlacesResponse)
      });

      const result = await handlePlaceSearch('restaurant', {
        latitude: 37.7749,
        longitude: -122.4194
      });
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.places).toHaveLength(1);
      expect(content.places[0].name).toBe('Test Place');
    });

    it('should handle place search without location', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockPlacesResponse)
      });

      const result = await handlePlaceSearch('restaurant');
      expect(result.isError).toBe(false);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'ZERO_RESULTS', results: [] })
      });

      const result = await handlePlaceSearch('nonexistent');
      expect(result.isError).toBe(true);
    });
  });

  describe('handlePlaceDetails', () => {
    const mockPlaceDetailsResponse = {
      status: 'OK',
      result: {
        name: 'Test Place',
        place_id: 'test_place_id',
        formatted_address: 'Test Address',
        geometry: { location: { lat: 37.7749, lng: -122.4194 } },
        formatted_phone_number: '123-456-7890',
        website: 'https://test.com'
      }
    };

    it('should handle successful place details request', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockPlaceDetailsResponse)
      });

      const result = await handlePlaceDetails('test_place_id');
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.name).toBe('Test Place');
      expect(content.website).toBe('https://test.com');
    });

    it('should handle invalid place ID', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'INVALID_REQUEST' })
      });

      const result = await handlePlaceDetails('invalid_id');
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDistanceMatrix', () => {
    const mockDistanceResponse = {
      status: 'OK',
      rows: [{
        elements: [{
          status: 'OK',
          distance: { text: '10 km', value: 10000 },
          duration: { text: '15 mins', value: 900 }
        }]
      }]
    };

    it('should handle successful distance matrix request', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockDistanceResponse)
      });

      const result = await handleDistanceMatrix(
        ['Origin'],
        ['Destination'],
        'driving'
      );
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.results[0].elements[0].distance.value).toBe(10000);
    });

    it('should handle invalid locations', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          status: 'OK',
          rows: [{ elements: [{ status: 'NOT_FOUND' }] }]
        })
      });

      const result = await handleDistanceMatrix(['Invalid'], ['Also Invalid']);
      expect(result.isError).toBe(true);
    });
  });

  describe('handleElevation', () => {
    const mockElevationResponse = {
      status: 'OK',
      results: [{
        elevation: 100,
        location: { lat: 37.7749, lng: -122.4194 },
        resolution: 10
      }]
    };

    it('should handle successful elevation request', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockElevationResponse)
      });

      const result = await handleElevation([
        { latitude: 37.7749, longitude: -122.4194 }
      ]);
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.results[0].elevation).toBe(100);
    });

    it('should handle invalid locations', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'INVALID_REQUEST' })
      });

      const result = await handleElevation([
        { latitude: -91, longitude: 181 }
      ]);
      expect(result.isError).toBe(true);
    });
  });

  describe('handleDirections', () => {
    const mockDirectionsResponse = {
      status: 'OK',
      routes: [{
        summary: 'Test Route',
        legs: [{
          distance: { text: '10 km', value: 10000 },
          duration: { text: '15 mins', value: 900 },
          steps: [{
            html_instructions: 'Turn right',
            distance: { text: '1 km', value: 1000 },
            duration: { text: '2 mins', value: 120 },
            travel_mode: 'DRIVING'
          }]
        }]
      }]
    };

    it('should handle successful directions request', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockDirectionsResponse)
      });

      const result = await handleDirections('Origin', 'Destination', 'driving');
      expect(result.isError).toBe(false);
      const content = JSON.parse(result.content[0].text);
      expect(content.routes[0].summary).toBe('Test Route');
      expect(content.routes[0].steps).toBeDefined();
    });

    it('should handle no route found', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'ZERO_RESULTS', routes: [] })
      });

      const result = await handleDirections('Invalid', 'Route');
      expect(result.isError).toBe(true);
    });

    it('should use default driving mode', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockDirectionsResponse)
      });

      await handleDirections('Origin', 'Destination');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('mode=driving')
      );
    });
  });
});