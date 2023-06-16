import client from '../slackWebApi'
import { kv } from '@vercel/kv'

const GROUP_SIZE = 3

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

    const [groups, remainder] = groupItems(users, GROUP_SIZE)
    for (const [index, user] of remainder.entries()) {
      if (groups[index]) {
        groups[index].push(user)
      }
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
              text: `${prefix}, you've been randomly grouped up so you can get to know each other! Schedule a 15 minute meeting when everyone's free.`
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

function groupItems<T>(items: T[], size: number): [T[][], T[]] {
  if (items.length === 0) {
    return [[], []]
  }

  const groups = []
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  if (groups.at(-1)!.length !== size) {
    return [groups.slice(0, -1), groups.at(-1)!]
  } else {
    return [groups, []]
  }
}
