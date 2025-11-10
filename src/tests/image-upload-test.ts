import { describe, it, expect } from 'vitest';
import { analyzeMedia } from '../lib/actions';

describe('Image Upload Tests', () => {
  it('should handle small images successfully', async () => {
    // Test with a small image (simulated data URI)
    const smallImageDataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z';

    const formData = new FormData();
    formData.append('media', smallImageDataUri);

    const result = await analyzeMedia({ status: 'idle' }, formData);

    expect(result.status).toBe('success');
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBeDefined();
    expect(result.data?.description).toBeDefined();
    expect(result.data?.hashtags).toBeDefined();
  });

  it('should reject oversized images', async () => {
    // Test with large image simulation (create a large data URI)
    const largeImageDataUri = 'data:image/jpeg;base64,' + 'A'.repeat(5 * 1024 * 1024); // 5MB string

    const formData = new FormData();
    formData.append('media', largeImageDataUri);

    const result = await analyzeMedia({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(result.error).toContain('Please upload a file');
  });

  it('should handle missing media gracefully', async () => {
    const formData = new FormData();

    const result = await analyzeMedia({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(result.error).toBe('Please upload a file.');
  });
});
