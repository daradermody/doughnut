import { WebClient } from '@slack/web-api'
import { Button } from '@slack/types'
import { userIds } from '../userIds'

export default async function render(client: WebClient, userId: string) {
  const isOptedIn = userIds.includes(userId)
  const includeButton: Button = isOptedIn ? {
    type: 'button',
    style: 'danger',
    text: {
      type: 'plain_text',
      text: 'Opt out'
    },
    action_id: 'remove_user'
  } : {
    type: 'button',
    style: 'primary',
    text: {
      type: 'plain_text',
      text: 'Count me in!'
    },
    action_id: 'add_user'
  }

  try {
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
  catch (error) {
    console.error(error);
  }
}
