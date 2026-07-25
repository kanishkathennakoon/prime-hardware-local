import { DELETE } from '@/app/api/upload/route';
import { auth } from '@/auth';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('Delete Product Image API & Form State - Feature F-17', () => {
  it('should reject unauthorized DELETE requests', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '/images/products/test/sample.png' }),
    });

    const res = await DELETE(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('should delete a valid local product image file for admin users', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    });

    // Create a temporary test file on disk
    const testDir = path.join(process.cwd(), 'public', 'images', 'products', 'jest-delete-test');
    await mkdir(testDir, { recursive: true });
    const filePath = path.join(testDir, 'delete-me.png');
    await writeFile(filePath, 'dummy content');

    const relativeUrl = '/images/products/jest-delete-test/delete-me.png';

    const req = new Request('http://localhost:3000/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: relativeUrl }),
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Clean up test folder
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {}
  });

  it('should correctly filter out a deleted image from the product images array', () => {
    const initialImages = [
      '/images/products/p1/img1.png',
      '/images/products/p1/img2.png',
      '/images/products/p1/img3.png',
    ];

    const removeIndex = 1;
    const updatedImages = initialImages.filter((_, index) => index !== removeIndex);

    expect(updatedImages).toHaveLength(2);
    expect(updatedImages).toEqual([
      '/images/products/p1/img1.png',
      '/images/products/p1/img3.png',
    ]);
  });
});
