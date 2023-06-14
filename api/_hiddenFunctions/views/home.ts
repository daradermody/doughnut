import { Button, KnownBlock } from '@slack/types'
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
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Time to get to know your colleagues! :tada:',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: "Every week you'll be grouped with two other random Siren people in a private chat where you can arrange a 30 minute call for some banter."
          }
        },
        {
          type: 'actions',
          elements: [
            await getOptInOrOutButton(userId),
          ]
        } as ActionsBlock,
        ...(ADMIN_IDS.includes(userId) ? getAdminBlocks() : [])
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
        text: 'Opt out'
      },
      action_id: 'remove_user'
    }
  } else {
    return {
      type: 'button',
      style: 'primary',
      text: {
        type: 'plain_text',
        text: 'Count me in!'
      },
      action_id: 'add_user'
    }
  }
}

function getAdminBlocks(): KnownBlock[] {
  return [
    {type: 'divider'},
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Admin"
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Assemble groups'
          },
          action_id: 'assemble'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Water cooler topic'
          },
          action_id: 'water_cooler_topic'
        }
      ]
    } as ActionsBlock,
    {
      type: 'context',
      elements: [
        {
          type: 'plain_text',
          text: `Version: ${process.env.VERCEL_GIT_COMMIT_SHA}`
        }
      ]
    }
  ]
}
