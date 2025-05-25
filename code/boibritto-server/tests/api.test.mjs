import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../api/index.js';

describe('GET /ping', () => {
  it('should return pong', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('pong');
  });
});
