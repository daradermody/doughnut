import { Button } from '@slack/types'
import client from '../slackWebApi'
import { kv } from '@vercel/kv'

export default async function renderHome(userId: string) {
  const isOptedIn = await kv.sismember('userIds', userId)
  const includeButton: Button = isOptedIn ? {
    type: 'button',
    style: 'danger',
    text: {
      type: 'plain_text',
      text: 'Opt out!'
    },
    action_id: 'remove_user'
  } : {
    type: 'button',
    style: 'primary',
    text: {
      type: 'plain_text',
      text: 'Count me in!!'
    },
    action_id: 'add_user'
  }

  await client.views.publish({
    user_id: userId,
    view: {
      type: 'home',
      callback_id: 'home_view',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Time to get to know your colleagues!* :tada:'
          }
        },
        {type: 'divider'},
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "Every week you'll be grouped with two other random Siren people in a private chat where you can arrange a 30 minute call for some banter."
          }
        },
        {
          type: 'actions',
          elements: [
            includeButton,
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Assemble people! (dev)'
              },
              action_id: 'assemble'
            }

          ]
        }
      ]
    }
  });
}
