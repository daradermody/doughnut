import client from '../slackWebApi'
import { kv } from '@vercel/kv'

const GROUP_SIZE = 2

export default async function assembleGroups() {
  const userIds = await kv.smembers('userIds')
  try {
    let users = await Promise.all(
      userIds
        .map(async id => {
          const {user} = await client.users.info({user: id})
          return user!
        })
    )
    users = users
      .filter(user => !user.is_bot && !user.deleted)
      .sort(() => Math.random() - 0.5)

    const groups = groupItems(users, GROUP_SIZE)
    const ignoredGroups = groups.filter(group => group.length !== GROUP_SIZE)
    if (ignoredGroups.length) {
      console.warn(`Ignoring this group as it doesn't have enough members: ${JSON.stringify(ignoredGroups[0].map(u => u.id))}`)
    }
    const filteredGroups = groups.filter(group => group.length === GROUP_SIZE)
    for (const group of filteredGroups) {
      const groupUserIds = group.map(user => user.id)
      const {channel} = await client.conversations.open({users: groupUserIds.join(',')})

      const firstUsers = group.slice(0, -1)
      const lastUser = group.at(-1)
      const prefix = `${firstUsers.map(u => `<@${u.id}>`).join(', ')} and <@${lastUser!.id}>`
      await client.chat.postMessage({
        channel: channel!.id!,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${prefix}, you've been randomly grouped up so you can get to know each other! Schedule a 30 minute meeting when everyone's free.`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Go to calendar'
                },
                url: 'https://calendar.google.com/'
              }

            ]
          }
        ]
      })
    }
  } catch (e) {
    console.error(e)
  }
}

function groupItems<T>(items: T[], size: number): T[][] {
  const groups = []
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups
}
