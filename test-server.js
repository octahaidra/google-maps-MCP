import { spawn } from 'child_process';
import assert from 'assert';

async function testServer() {
  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    assert.deepStrictEqual(healthData, { status: 'ok' }, 'Health check should return ok status');
    console.log('Health check passed');    // Test geocoding
    console.log('Testing geocoding...');
    const geocodeResponse = await fetch('http://localhost:3000/trpc/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'mutation',
        params: {
          input: { "address": "1600 Amphitheatre Parkway, Mountain View, CA" }
        }
      })
    });
    const geocodeData = await geocodeResponse.json();
    console.log('Geocode response:', JSON.stringify(geocodeData, null, 2));
    assert(geocodeData?.result?.data?.content?.[0]?.text, 'Geocoding response should have content');
    const geocodeContent = JSON.parse(geocodeData.result.data.content[0].text);
    assert(typeof geocodeContent.location?.lat === 'number', 'Geocoding response should have latitude');
    assert(typeof geocodeContent.location?.lng === 'number', 'Geocoding response should have longitude');
    assert(typeof geocodeContent.formatted_address === 'string', 'Geocoding response should have formatted_address');
    assert(typeof geocodeContent.place_id === 'string', 'Geocoding response should have place_id');
    console.log('Geocoding test passed');

    // Test place search with and without location
    console.log('Testing place search...');
    const placeSearchTests = [
      {
        name: 'with location',
        body: {
          query: 'restaurants in San Francisco',
          location: { latitude: 37.7749, longitude: -122.4194 }
        }
      },
      {
        name: 'without location',
        body: { query: 'restaurants in San Francisco' }
      }
    ];

    for (const test of placeSearchTests) {      const placeSearchResponse = await fetch('http://localhost:3000/trpc/searchPlaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 2,
          jsonrpc: '2.0',
          method: 'mutation',
          params: {
            input: test.body
          }
        })
      });
      const placeSearchData = await placeSearchResponse.json();
      assert(placeSearchData?.result?.data?.content[0]?.text, `Place search ${test.name} should have content`);
      const placeSearchContent = JSON.parse(placeSearchData.result.data.content[0].text);
      assert(Array.isArray(placeSearchContent.places), `Place search ${test.name} should return array of places`);
      console.log(`Place search ${test.name} test passed`);
    }

    // Test place details
    console.log('Testing place details...');
    // First get a place_id from search
    const searchResponse = await fetch('http://localhost:3000/trpc/searchPlaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Google headquarters' })
    });
    const searchData = await searchResponse.json();
    const searchContent = JSON.parse(searchData.data.content[0].text);
    const placeId = searchContent.places[0].place_id;

    const placeDetailsResponse = await fetch('http://localhost:3000/trpc/placeDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: placeId })
    });
    const placeDetailsData = await placeDetailsResponse.json();
    assert(placeDetailsData?.data?.content[0]?.text, 'Place details should have content');
    const placeDetailsContent = JSON.parse(placeDetailsData.data.content[0].text);
    assert(placeDetailsContent.name, 'Place details should include name');
    console.log('Place details test passed');

    // Test distance matrix
    console.log('Testing distance matrix...');
    const distanceMatrixResponse = await fetch('http://localhost:3000/trpc/distanceMatrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origins: ['San Francisco, CA'],
        destinations: ['Mountain View, CA'],
        mode: 'driving'
      })
    });
    const distanceMatrixData = await distanceMatrixResponse.json();
    assert(distanceMatrixData?.data?.content[0]?.text, 'Distance matrix should have content');
    const distanceMatrixContent = JSON.parse(distanceMatrixData.data.content[0].text);
    assert(distanceMatrixContent.results?.[0]?.elements?.[0], 'Distance matrix should return route information');
    console.log('Distance matrix test passed');

    // Test elevation
    console.log('Testing elevation...');
    const elevationResponse = await fetch('http://localhost:3000/trpc/elevation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [{ latitude: 37.7749, longitude: -122.4194 }]
      })
    });
    const elevationData = await elevationResponse.json();
    assert(elevationData?.data?.content[0]?.text, 'Elevation should have content');
    const elevationContent = JSON.parse(elevationData.data.content[0].text);
    assert(elevationContent.results?.[0]?.elevation, 'Elevation should return elevation data');
    console.log('Elevation test passed');

    // Test directions
    console.log('Testing directions...');
    const directionsResponse = await fetch('http://localhost:3000/trpc/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'San Francisco, CA',
        destination: 'Mountain View, CA',
        mode: 'driving'
      })
    });
    const directionsData = await directionsResponse.json();
    assert(directionsData?.data?.content[0]?.text, 'Directions should have content');
    const directionsContent = JSON.parse(directionsData.data.content[0].text);
    assert(directionsContent.routes?.[0]?.steps, 'Directions should return route steps');
    console.log('Directions test passed');

    // Test error handling
    console.log('Testing error handling...');
    const errorTests = [
      {
        name: 'invalid geocode',
        endpoint: 'geocode',
        body: { address: '' }
      },
      {
        name: 'invalid coordinates',
        endpoint: 'reverseGeocode',
        body: { latitude: -91, longitude: 181 }
      },
      {
        name: 'invalid place search',
        endpoint: 'searchPlaces',
        body: { query: '' }
      }
    ];

    for (const test of errorTests) {
      const errorResponse = await fetch(`http://localhost:3000/trpc/${test.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      });
      const errorData = await errorResponse.json();
      assert(errorData?.data?.isError, `${test.name} should return error status`);
      console.log(`${test.name} error handling test passed`);
    }

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    server.kill();
  }
}

testServer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});