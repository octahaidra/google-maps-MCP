import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { handleGeocode, handleReverseGeocode, handlePlaceSearch, handlePlaceDetails, handleDistanceMatrix, handleElevation, handleDirections } from './index.js';

const t = initTRPC.create();

// Create router
const router = t.router({
  geocode: t.procedure
    .input(z.object({ address: z.string() }))
    .mutation(async ({ input }) => {
      return await handleGeocode(input.address);
    }),

  reverseGeocode: t.procedure
    .input(z.object({ 
      latitude: z.number(),
      longitude: z.number()
    }))
    .mutation(async ({ input }) => {
      return await handleReverseGeocode(input.latitude, input.longitude);
    }),

  searchPlaces: t.procedure
    .input(z.object({
      query: z.string(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number()
      }).optional(),
      radius: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      return await handlePlaceSearch(input.query, input.location, input.radius);
    }),

  placeDetails: t.procedure
    .input(z.object({ place_id: z.string() }))
    .mutation(async ({ input }) => {
      return await handlePlaceDetails(input.place_id);
    }),

  distanceMatrix: t.procedure
    .input(z.object({
      origins: z.array(z.string()),
      destinations: z.array(z.string()),
      mode: z.enum(["driving", "walking", "bicycling", "transit"]).optional()
    }))
    .mutation(async ({ input }) => {
      return await handleDistanceMatrix(input.origins, input.destinations, input.mode);
    }),

  elevation: t.procedure
    .input(z.object({
      locations: z.array(z.object({
        latitude: z.number(),
        longitude: z.number()
      }))
    }))
    .mutation(async ({ input }) => {
      return await handleElevation(input.locations);
    }),

  directions: t.procedure
    .input(z.object({
      origin: z.string(),
      destination: z.string(),
      mode: z.enum(["driving", "walking", "bicycling", "transit"]).optional()
    }))
    .mutation(async ({ input }) => {
      return await handleDirections(input.origin, input.destination, input.mode);
    })
});

export type Router = typeof router;
export { router }; 