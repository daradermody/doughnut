import client from '../slackWebApi'
import { kv } from '@vercel/kv'

export default async function waterCoolerTopic() {
  const nextTopicIndex = await kv.get<number>('nextTopicIndex') || 0;

  if (!topics[nextTopicIndex]) {
    throw new Error('No more topics left :(')
  }

  await client.chat.postMessage({
    channel: process.env.WATER_COOLER_CHANNEL!,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: `Time for a water cooler topic!`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${topics[nextTopicIndex]}`
        }
      }
    ]
  })
  await kv.incr('nextTopicIndex');
}

const topics = [
  `Have you found any new TV shows or films lately that you loved? :movie_camera:`,
  `What's your favourite form of potato? :potato:`,
  `What's a hobby or activity you've recently picked up? :dancer:`,
  `What's the most beautiful place you've ever been? :beach_with_umbrella:`,
  `What music have you been listening to these days? :saxophone:`,
  `'Share the most fun or exciting thing you've done recently' in your free time. Bonus: post a pic! :parachute:`,
  `How do you like your eggs? :fried_egg:`,
  `What would you pick for your theme song? :musical_score:`,
  `Learn any new good life hacks recently? Share your favourites :sunglasses:`,
  `Post your favourite GIF (or a random one)! :frame_with_picture:`,
  `What are your top 5 TV shows? :tv:`
]
