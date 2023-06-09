import { AllMiddlewareArgs, BlockAction, SlackActionMiddlewareArgs } from '@slack/bolt'
import { userIds } from '../userIds'

export default async function assembleGroups({ ack, client, context }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) {
  await ack();

  try {
    let users = await Promise.all(
      userIds
        .map(async id => {
          const {user} = await client.users.info({token: context.botToken, user: id})
          return user!
        })
    )
    users = users
      .filter(user => !user.is_bot && !user.deleted)
      .sort(() => Math.random() - 0.5)

    const groups = groupItems(users, 3).filter(group => group.length === 3)
    for (const group of groups) {
      const groupUserIds = group.map(user => user.id)
      const {channel} = await client.conversations.open({token: context.botToken, users: groupUserIds.join(',')})
      await client.chat.postMessage({
        token: context.botToken,
        channel: channel!.id!,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<@${group[0].id}>, <@${group[1].id}> and <@${group[2].id}>, you've been randomly grouped up so you can get to know each other! Schedule a 30 minute meeting when everyone's free.`
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
