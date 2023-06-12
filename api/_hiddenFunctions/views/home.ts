import { Button } from '@slack/types'
import client from '../slackWebApi'
import { kv } from '@vercel/kv'
import { ActionsBlock } from '@slack/web-api'

const ADMIN_IDS = [
  'UBM7CL7M3', // Dara on Siren Solutions
  'U03S44R77JL' // Dara on Ca3 (test env)
]

export default async function renderHome(userId: string) {
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
            text: 'Every week you\'ll be grouped with two other random Siren people in a private chat where you can arrange a 30 minute call for some banter.'
          }
        },
        {
          type: 'actions',
          elements: [
            await getOptInOrOutButton(userId),
          ]
        } as ActionsBlock,
        ...(ADMIN_IDS.includes(userId) ? [
          {type: 'divider'},
          {
            type: 'actions',
            elements: getAdminButtons()
          } as ActionsBlock
        ] : [])
      ]
    }
  })
}

async function getOptInOrOutButton(userId: string): Promise<Button> {
  const isOptedIn = await kv.sismember('userIds', userId)
  if (isOptedIn) {
    return {
      type: 'button',
      style: 'danger',
      text: {
        type: 'plain_text',
        text: 'Opt out!'
      },
      action_id: 'remove_user'
    }
  } else {
    return {
      type: 'button',
      style: 'primary',
      text: {
        type: 'plain_text',
        text: 'Count me in!!'
      },
      action_id: 'add_user'
    }
  }
}

function getAdminButtons(): Button[] {
  return [
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
