import { kv } from '@vercel/kv';

export async function addUser(userId: string) {
  await kv.sadd('userIds', userId);
}

export async function removeUser(userId: string) {
  await kv.srem('userIds', userId)
}
