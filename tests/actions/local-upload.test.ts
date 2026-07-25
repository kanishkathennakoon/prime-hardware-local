import { POST } from '@/app/api/upload/route';
import { auth } from '@/auth';
import { rm } from 'fs/promises';
import path from 'path';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('Local File Upload API Route - Semantic Product Directories', () => {
  const createdTestPaths: string[] = [];

  afterAll(async () => {
    // Clean up created test directories/files after tests complete to avoid directory clutter
    for (const relativePath of createdTestPaths) {
      try {
        const fullPath = path.join(process.cwd(), 'public', relativePath);
        await rm(fullPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it('should reject unauthorized requests', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const mockFile = new File(['sample image content'], 'test.png', { type: 'image/png' });
    formData.append('file', mockFile);

    const req = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Unauthorized');
  });

  it('should upload files to semantic product directory public/images/products/<slug>/', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    });

    const formData = new FormData();
    const mockFile = new File(['sample image content'], 'sample-power-drill.png', { type: 'image/png' });
    formData.append('file', mockFile);
    formData.append('folder', 'jest-test-product');

    const req = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.url).toMatch(/^\/images\/products\/jest-test-product\/\d+-[a-z0-9]+-sample-power-drill\.png$/);

    createdTestPaths.push(body.url);
    createdTestPaths.push('/images/products/jest-test-product');
  });

  it('should default to general product folder when no folder prop is passed', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    });

    const formData = new FormData();
    const mockFile = new File(['sample image content'], 'paint-bucket.png', { type: 'image/png' });
    formData.append('file', mockFile);

    const req = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.url).toMatch(/^\/images\/products\/general\/\d+-[a-z0-9]+-paint-bucket\.png$/);

    createdTestPaths.push(body.url);
    createdTestPaths.push('/images/products/general');
  });
});

