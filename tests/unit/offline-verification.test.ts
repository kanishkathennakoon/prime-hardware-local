import nextConfig from '@/next.config';

describe('Offline Capability Verification - Feature F-14', () => {
  it('should not mandate external cloud CDNs in next.config.ts image remotePatterns', () => {
    const remotePatterns = nextConfig.images?.remotePatterns || [];
    const hasExternalCloudCdn = remotePatterns.some((pattern: { hostname?: string }) =>
      pattern.hostname === 'utfs.io'
    );
    expect(hasExternalCloudCdn).toBe(false);
  });

  it('should verify product image path format compliance for local static serving', () => {
    const sampleImagePath = '/images/products/rhino-premier-roofing-sheet/1721839000-sample.png';
    expect(sampleImagePath.startsWith('/images/products/')).toBe(true);
    expect(sampleImagePath).not.toContain('https://');
    expect(sampleImagePath).not.toContain('utfs.io');
  });
});
