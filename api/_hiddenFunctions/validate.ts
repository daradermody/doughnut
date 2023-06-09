import * as crypto from 'crypto'
import { VercelRequest } from '@vercel/node'
import { Readable } from 'node:stream'

export default async function validateSlackRequest(req: VercelRequest, signingSecret: string) {
  const body = (await buffer(req)).toString('utf8');
  const hmac = crypto
    .createHmac('sha256', signingSecret)
    .update(`v0:${req.headers['x-slack-request-timestamp']}:${body}`)
    .digest('hex')

  const slackSignature = req.headers['x-slack-signature']
  const computedSlackSignature = `v0=${hmac}`
  return computedSlackSignature === slackSignature
}

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

