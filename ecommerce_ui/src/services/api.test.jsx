import api from './api';

describe('API Axios Instance', () => {

  test('has correct base URL and default content-type header', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080/api');
    
    const contentType = api.defaults.headers.common['Content-Type'] || api.defaults.headers['Content-Type'];
    expect(contentType).toBe('application/json');
  });

  test('exports defined api instance', () => {
    expect(api).toBeDefined();
  });

});